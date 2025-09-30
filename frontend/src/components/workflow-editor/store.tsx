import type React from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react"
import type { EditorState, RootConfig, Workflow, WFNode, Edge } from "./types"

const SAMPLE: RootConfig = {
  workflows: {
    patientsearch: {
      name: "patientsearch",
      description: "Handles patient search verification",
      nodeOrder: ["collectIdentifiers", "newPatient", "end"],
      nodes: {
        collectIdentifiers: {
          name: "collectIdentifiers",
          isFirstNode: true,
          preAction: [],
          stateKeys: [{ id: "verified", required: true }],
          postAction: [],
          tools: [
            {
              name: "lookupPatient",
              description: "Use this to lookup the patient info",
              parameters: [
                { id: "firstName", type: "string", required: true },
                { id: "lastName", type: "string", required: true },
                { id: "dob", type: "string (yyyy-mm-dd)", required: true },
              ],
            },
          ],
          prompt:
            "Ask for full name and date of birth. Validate inputs, then trigger lookupPatient and tell the user you'll pull up their information.",
          edges: [{ to: "newPatient", condition: "if patient not found after 2 attempts" }],
          position: { x: 100, y: 120 },
        },
        newPatient: {
          name: "newPatient",
          prompt: "Inform the user they will be treated as a new patient and continue the flow.",
          position: { x: 420, y: 120 },
        },
        end: {
          name: "end",
          prompt:
            "If the caller stated their intent, carry it forward after completing patientsearch. Trigger chooseScenario without re-asking.",
          position: { x: 260, y: 320 },
        },
      },
    },
    bookAppointment: {
      name: "bookAppointment",
      description: "Handles patient appointment booking and setup",
      requiredWorkflow: {
        must: ["patientsearch"],
        desc: "patientsearch is required before booking; ensure end node is called",
      },
      nodeOrder: ["getProviders", "getAppointmentTypes", "getSlotsAndBook"],
      nodes: {
        getProviders: {
          name: "getProviders",
          isFirstNode: true,
          preAction: ["fetchDepartmentsAndProviders"],
          stateKeys: [
            {
              id: "selectedProvider",
              required: true,
              nodeAffects: {
                name: "getAppointmentTypes",
                description: "Provider changed; refresh appointment types and ask user to select again.",
              },
            },
          ],
          prompt: "Ask for provider name (first + last). Validate/confirm or list options. Proceed once selected.",
          position: { x: 120, y: 100 },
          edges: [{ to: "getAppointmentTypes" }],
        },
        getAppointmentTypes: {
          name: "getAppointmentTypes",
          preAction: ["getAppointmentTypes"],
          stateKeys: [
            {
              id: "selectedAppointmentType",
              required: true,
              description: "If already provided, update state and proceed silently. Otherwise, ask.",
              nodeAffects: {
                name: "getSlotsAndBook",
                description: "Appointment type changed; refresh slots and ask user to select.",
              },
            },
          ],
          prompt: "Thank user and ask for appointment type. Present options, then proceed directly.",
          position: { x: 420, y: 100 },
          edges: [{ to: "getSlotsAndBook" }],
        },
        getSlotsAndBook: {
          name: "getSlotsAndBook",
          preAction: ["getSlots"],
          stateKeys: [{ id: "selectedSlot", required: true }],
          tools: [
            {
              name: "getAvailableSlots",
              description: "to get filtered slots",
              parameters: [{ id: "date", type: "string (MM/DD/YYYY)", required: true }],
            },
          ],
          postAction: ["bookAppointment"],
          prompt: "",
          position: { x: 720, y: 100 },
          edges: [],
        },
      },
    },
  },
  states: {
    conversationState: {
      currentWorkflow: "",
      previousWorkflow: "",
      completedWorkflows: [],
    },
    data: { patientInfo: {}, appointments: [] },
  },
}

type Action =
  | { type: "LOAD"; payload: RootConfig }
  | { type: "SELECT_WORKFLOW"; name?: string }
  | { type: "ADD_WORKFLOW"; workflow: Workflow }
  | { type: "UPDATE_WORKFLOW_META"; name: string; description?: string }
  | { type: "DELETE_WORKFLOW"; name: string }
  | { type: "ADD_NODE"; workflow: string; node: WFNode }
  | { type: "UPDATE_NODE"; workflow: string; nodeName: string; node: Partial<WFNode> }
  | { type: "RENAME_NODE"; workflow: string; oldName: string; newName: string }
  | { type: "DELETE_NODE"; workflow: string; nodeName: string }
  | { type: "SET_POSITION"; workflow: string; nodeName: string; position: { x: number; y: number } }
  | { type: "ADD_EDGE"; workflow: string; from: string; edge: Edge }
  | { type: "DELETE_EDGE"; workflow: string; from: string; to: string }
  | { type: "UPDATE_EDGE"; workflow: string; from: string; to: string; patch: Partial<Edge>; newTo?: string }
  | { type: "REORDER_NODES"; workflow: string; nodeOrder: string[] }
  | { type: "SELECT_NODE"; name?: string }
  | { type: "SET_TAB"; tab: "workflows" | "nodes" }

const STORAGE_KEY = "workflow-editor:data"

function reducer(state: EditorState, action: Action): EditorState {
  switch (action.type) {
    case "LOAD":
      return { ...state, data: action.payload }
    case "SELECT_WORKFLOW":
      return { ...state, selectedWorkflow: action.name, selectedNode: undefined }
    case "ADD_WORKFLOW": {
      const wf = action.workflow
      // Initialize nodeOrder if not provided
      const workflowWithOrder = {
        ...wf,
        nodeOrder: wf.nodeOrder || Object.keys(wf.nodes)
      }
      return {
        ...state,
        data: { ...state.data, workflows: { ...state.data.workflows, [wf.name]: workflowWithOrder } },
        selectedWorkflow: wf.name,
        activeTab: "nodes",
      }
    }
    case "UPDATE_WORKFLOW_META": {
      const wf = state.data.workflows[action.name]
      if (!wf) return state
      return {
        ...state,
        data: {
          ...state.data,
          workflows: {
            ...state.data.workflows,
            [action.name]: { ...wf, description: action.description ?? wf.description },
          },
        },
      }
    }
    case "DELETE_WORKFLOW": {
      const { [action.name]: _, ...rest } = state.data.workflows
      const nextSelected = state.selectedWorkflow === action.name ? undefined : state.selectedWorkflow
      return {
        ...state,
        data: { ...state.data, workflows: rest },
        selectedWorkflow: nextSelected,
        selectedNode: undefined,
      }
    }
    case "ADD_NODE": {
      const wf = state.data.workflows[action.workflow]
      if (!wf) return state
      
      const currentOrder = wf.nodeOrder || Object.keys(wf.nodes)
      const lastNodeName = currentOrder[currentOrder.length - 1]
      
      // Update the last node to connect to the new node
      const updatedNodes = { ...wf.nodes }
      if (lastNodeName && updatedNodes[lastNodeName]) {
        updatedNodes[lastNodeName] = {
          ...updatedNodes[lastNodeName],
          edges: [...(updatedNodes[lastNodeName].edges || []), { to: action.node.name }]
        }
      }
      
      return {
        ...state,
        data: {
          ...state.data,
          workflows: {
            ...state.data.workflows,
            [action.workflow]: {
              ...wf,
              nodes: { ...updatedNodes, [action.node.name]: action.node },
              nodeOrder: [...currentOrder, action.node.name],
            },
          },
        },
        selectedNode: action.node.name,
        activeTab: "nodes",
      }
    }
    case "UPDATE_NODE": {
      const wf = state.data.workflows[action.workflow]
      if (!wf) return state
      const node = wf.nodes[action.nodeName]
      if (!node) return state
      const updated = { ...node, ...action.node }
      // handle rename via UPDATE_NODE with name change skipped; we have explicit RENAME action
      return {
        ...state,
        data: {
          ...state.data,
          workflows: {
            ...state.data.workflows,
            [action.workflow]: {
              ...wf,
              nodes: { ...wf.nodes, [action.nodeName]: updated },
            },
          },
        },
      }
    }
    case "RENAME_NODE": {
      const wf = state.data.workflows[action.workflow]
      if (!wf) return state
      const node = wf.nodes[action.oldName]
      if (!node || action.oldName === action.newName) return state
      const { [action.oldName]: _, ...rest } = wf.nodes
      const renamed: WFNode = { ...node, name: action.newName }
      // update edges referencing old name
      const fixedNodes = Object.fromEntries(
        Object.entries(rest).map(([k, v]) => {
          const edges = (v.edges || []).map((e) => (e.to === action.oldName ? { ...e, to: action.newName } : e))
          return [k, { ...v, edges }]
        }),
      )
      return {
        ...state,
        data: {
          ...state.data,
          workflows: {
            ...state.data.workflows,
            [action.workflow]: {
              ...wf,
              nodes: { ...fixedNodes, [action.newName]: renamed },
            },
          },
        },
        selectedNode: action.newName,
      }
    }
    case "DELETE_NODE": {
      const wf = state.data.workflows[action.workflow]
      if (!wf) return state
      const { [action.nodeName]: _, ...rest } = wf.nodes
      // remove edges pointing to deleted node
      const cleaned = Object.fromEntries(
        Object.entries(rest).map(([k, v]) => {
          const edges = (v.edges || []).filter((e) => e.to !== action.nodeName)
          return [k, { ...v, edges }]
        }),
      )
      // remove from nodeOrder
      const updatedNodeOrder = (wf.nodeOrder || Object.keys(wf.nodes)).filter(name => name !== action.nodeName)
      const nextSelected = state.selectedNode === action.nodeName ? undefined : state.selectedNode
      return {
        ...state,
        data: {
          ...state.data,
          workflows: { 
            ...state.data.workflows, 
            [action.workflow]: { 
              ...wf, 
              nodes: cleaned,
              nodeOrder: updatedNodeOrder
            } 
          },
        },
        selectedNode: nextSelected,
      }
    }
    case "SET_POSITION": {
      const wf = state.data.workflows[action.workflow]
      if (!wf) return state
      const node = wf.nodes[action.nodeName]
      if (!node) return state
      return {
        ...state,
        data: {
          ...state.data,
          workflows: {
            ...state.data.workflows,
            [action.workflow]: {
              ...wf,
              nodes: {
                ...wf.nodes,
                [action.nodeName]: { ...node, position: action.position },
              },
            },
          },
        },
      }
    }
    case "ADD_EDGE": {
      const wf = state.data.workflows[action.workflow]
      if (!wf) return state
      const fromNode = wf.nodes[action.from]
      if (!fromNode) return state
      const edges = [...(fromNode.edges || []), action.edge]
      return {
        ...state,
        data: {
          ...state.data,
          workflows: {
            ...state.data.workflows,
            [action.workflow]: {
              ...wf,
              nodes: { ...wf.nodes, [action.from]: { ...fromNode, edges } },
            },
          },
        },
      }
    }
    case "DELETE_EDGE": {
      const wf = state.data.workflows[action.workflow]
      if (!wf) return state
      const fromNode = wf.nodes[action.from]
      if (!fromNode) return state
      const edges = (fromNode.edges || []).filter((e) => !(e.to === action.to))
      return {
        ...state,
        data: {
          ...state.data,
          workflows: {
            ...state.data.workflows,
            [action.workflow]: {
              ...wf,
              nodes: { ...wf.nodes, [action.from]: { ...fromNode, edges } },
            },
          },
        },
      }
    }
    case "UPDATE_EDGE": {
      const wf = state.data.workflows[action.workflow]
      if (!wf) return state
      const fromNode = wf.nodes[action.from]
      if (!fromNode) return state
      const edges = (fromNode.edges || []).map((e) =>
        e.to === action.to ? { ...e, ...action.patch, to: action.newTo ?? e.to } : e,
      )
      return {
        ...state,
        data: {
          ...state.data,
          workflows: {
            ...state.data.workflows,
            [action.workflow]: {
              ...wf,
              nodes: { ...wf.nodes, [action.from]: { ...fromNode, edges } },
            },
          },
        },
      }
    }
    case "REORDER_NODES": {
      const wf = state.data.workflows[action.workflow]
      if (!wf) return state
      
      // Update nodeOrder and also update the nodes object to match the new order
      const reorderedNodes: Record<string, WFNode> = {}
      action.nodeOrder.forEach(nodeName => {
        if (wf.nodes[nodeName]) {
          reorderedNodes[nodeName] = wf.nodes[nodeName]
        }
      })
      
      // Update edges to follow the new order
      const updatedNodes: Record<string, WFNode> = {}
      action.nodeOrder.forEach((nodeName, index) => {
        const node = reorderedNodes[nodeName]
        if (node) {
          // Clear existing edges
          const updatedNode: WFNode = { ...node, edges: [] }
          
          // Add edge to next node in order (if not the last node)
          if (index < action.nodeOrder.length - 1) {
            const nextNodeName = action.nodeOrder[index + 1]
            updatedNode.edges = [{ to: nextNodeName }]
          }
          
          updatedNodes[nodeName] = updatedNode
        }
      })
      
      return {
        ...state,
        data: {
          ...state.data,
          workflows: {
            ...state.data.workflows,
            [action.workflow]: {
              ...wf,
              nodeOrder: action.nodeOrder,
              nodes: updatedNodes,
            },
          },
        },
      }
    }
    case "SELECT_NODE":
      return { ...state, selectedNode: action.name }
    case "SET_TAB":
      return { ...state, activeTab: action.tab }
    default:
      return state
  }
}

const EditorCtx = createContext<{
  state: EditorState
  dispatch: React.Dispatch<Action>
  importJSON: (json: string) => { ok: boolean; error?: string }
  exportJSON: () => string
}>({} as any)

export function EditorProvider({ children, initialData }: { children: React.ReactNode; initialData?: RootConfig }) {
  const [state, dispatch] = useReducer(reducer, {
    data: initialData ?? SAMPLE,
    activeTab: "workflows",
  } as EditorState)

  // load from localStorage on mount once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as RootConfig
        
        // Migrate existing workflows to include nodeOrder
        const migratedWorkflows = Object.fromEntries(
          Object.entries(parsed.workflows).map(([name, workflow]) => [
            name,
            {
              ...workflow,
              nodeOrder: workflow.nodeOrder || Object.keys(workflow.nodes)
            }
          ])
        )
        
        const migratedData = {
          ...parsed,
          workflows: migratedWorkflows
        }
        
        dispatch({ type: "LOAD", payload: migratedData })
      }
    } catch {}
  }, [])

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data))
    } catch {}
  }, [state.data])

  const importJSON = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json) as RootConfig
      if (!parsed?.workflows || typeof parsed.workflows !== "object") {
        return { ok: false, error: "Invalid format: missing workflows" }
      }
      dispatch({ type: "LOAD", payload: parsed })
      return { ok: true }
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "Failed to parse JSON" }
    }
  }, [])

  const exportJSON = useCallback(() => JSON.stringify(state.data, null, 2), [state.data])

  const value = useMemo(() => ({ state, dispatch, importJSON, exportJSON }), [state, importJSON, exportJSON])

  return <EditorCtx.Provider value={value}>{children}</EditorCtx.Provider>
}

export function useEditor() {
  return useContext(EditorCtx)
}
