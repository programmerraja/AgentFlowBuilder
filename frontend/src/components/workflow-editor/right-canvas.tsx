
import { useCallback, useRef, useState } from "react"
import { useEditor } from "./store"
import type { WFNode } from "./types"
import { ReactFlow } from "reactflow"
import "reactflow/dist/style.css"

// --- Shared types/consts ---
type Point = { x: number; y: number }
const NODE_W = 220
const NODE_H = 52

export function RightCanvas() {
  const { state, dispatch } = useEditor()
  const wfName = state.selectedWorkflow
  const workflow = wfName ? state.data.workflows[wfName] : undefined

  if (!workflow) {
    return (
      <section aria-label="canvas" className="flex-1 min-w-0 h-full flex items-center justify-center bg-muted">
        <p className="text-sm text-muted-foreground">
          Select a workflow to view and edit its graph.
        </p>
      </section>
    )
  }
  console.log("workflow", state.data.workflows,workflow)
  return <ReactFlowView workflow={workflow} dispatch={dispatch} state={state} />
}


function ReactFlowView({ workflow, dispatch, state }: any) {
  const containerRef = useRef<HTMLDivElement>(null)
  const nodeOrder = workflow.nodeOrder || Object.keys(workflow.nodes || {})
  const wfNodes = nodeOrder.map((name: string) => workflow.nodes[name]).filter(Boolean)
  console.log("wfNodes", wfNodes)
  const fallbackPos = (idx: number) => {
    return { x: 200, y: 80 + idx * (NODE_H + 80) }
  }

  const truncate = (t?: string, n = 24) => (t && t.length > n ? `${t.slice(0, n)}…` : t || "")

  const nodes = wfNodes.map((n: any, i: number) => {
    const pos = n.position || fallbackPos(i)
    return {
      id: n.name,
      position: pos,
      data: {
        label: (
          <div className="flex items-center justify-between w-full">
            <div className="text-sm font-medium truncate leading-none py-1">{n.name}</div>
            <div className="flex items-center gap-1 ml-2">
              <button
                className="w-4 h-4 flex items-center justify-center hover:bg-accent rounded text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  // Duplicate node
                  const newNodeName = `${n.name}_copy_${Date.now()}`
                  dispatch({
                    type: "ADD_NODE",
                    workflow: workflow.name,
                    node: {
                      ...n,
                      name: newNodeName,
                      position: { x: pos.x + 50, y: pos.y + 50 }
                    }
                  })
                }}
                title="Duplicate node"
              >
                ⧉
              </button>
              <button
                className="w-4 h-4 flex items-center justify-center hover:bg-destructive rounded text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  dispatch({
                    type: "DELETE_NODE",
                    workflow: workflow.name,
                    nodeName: n.name
                  })
                }}
                title="Delete node"
              >
                🗑
              </button>
            </div>
          </div>
        ),
      },
      style: {
        width: NODE_W + 60,
        height: NODE_H,
        border: "1px solid hsl(var(--border))",
        background: "hsl(var(--card))",
        color: "hsl(var(--foreground))",
        borderRadius: 10,
        boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
        padding: 8,
      },
      draggable: true,
      selectable: true,
      type: "default",
    }
  })

  const edges: any[] = []
  wfNodes.forEach((n: any) => {
    (n.edges || []).forEach((e: any, idx: number) => {
      const condition = truncate(e.condition, 24)
      const hasCondition = e.condition && e.condition.trim() !== ""
      
      edges.push({
        id: `${n.name}->${e.to}-${idx}`,
        source: n.name,
        target: e.to,
        type: "smoothstep",
        markerEnd: { type: "arrowclosed", width: 16, height: 16 },
        label: hasCondition ? condition : "Configure condition",
        labelStyle: { fill: "hsl(var(--foreground))", fontSize: 11, fontWeight: 500 },
        labelBgStyle: { 
          fill: hasCondition ? "hsl(var(--secondary))" : "hsl(var(--muted))", 
          color: "hsl(var(--foreground))", 
          stroke: "hsl(var(--border))" 
        },
        labelBgPadding: [2, 6],
        labelBgBorderRadius: 6,
        style: { stroke: "hsl(var(--muted-foreground))", strokeWidth: 1.75 },
      })
    })
  })
  console.log("edges", edges)

  const onConnect = useCallback((connection: any) => {
    if (!workflow || !connection.source || !connection.target) return
    if (connection.source === connection.target) return
    const from = connection.source
    const to = connection.target
    const exists = (workflow.nodes[from]?.edges || []).some((e: any) => e.to === to)
    if (!exists) {
      dispatch({ type: "ADD_EDGE", workflow: workflow.name, from, edge: { to } })
    }
  }, [dispatch, workflow])

  const onEdgesDelete = useCallback((deleted: any[]) => {
    if (!workflow) return
    deleted.forEach((e) => {
      if (e.source && e.target) {
        dispatch({ type: "DELETE_EDGE", workflow: workflow.name, from: e.source, to: e.target })
      }
    })
  }, [dispatch, workflow])

  const onNodeDragStop = useCallback((_: any, node: any) => {
    if (!workflow) return
    dispatch({
      type: "SET_POSITION",
      workflow: workflow.name,
      nodeName: node.id,
      position: { x: node.position.x, y: node.position.y },
    })
  }, [dispatch, workflow])

  const onSelectionChange = useCallback(({ nodes }: { nodes: any[]; edges: any[] }) => {
    if (!workflow) return
    if (nodes.length === 1) {
      dispatch({ type: "SELECT_NODE", name: nodes[0].id })
      dispatch({ type: "SET_TAB", tab: "nodes" })
    }
  }, [dispatch, workflow])

  const onEdgeClick = useCallback((_: any, edge: any) => {
    if (!workflow) return
    if (edge.source) {
      dispatch({ type: "SELECT_NODE", name: edge.source })
      dispatch({ type: "SET_TAB", tab: "nodes" })
    }
  }, [dispatch, workflow])


  const onDragOver = useCallback((ev: React.DragEvent) => {
    ev.preventDefault()
    ev.dataTransfer.dropEffect = "move"
  }, [])

  const uniqueName = (base: string) => {
    if (!workflow) return base
    let idx = 1
    let name = base
    const existing = new Set(Object.keys(workflow.nodes))
    while (existing.has(name)) {
      name = `${base}${idx++}`
    }
    return name
  }

  const onDrop = useCallback((ev: React.DragEvent) => {
    if (!workflow) return
    ev.preventDefault()
    const raw =
      ev.dataTransfer.getData("application/x-node-template") ||
      ev.dataTransfer.getData("application/reactflow") ||
      ""
    let tmpl: { base?: string; label?: string } = {}
    try {
      tmpl = raw ? JSON.parse(raw) : {}
    } catch {}
    const base = tmpl.base || "newNode"
    const name = uniqueName(base)
    const rect = containerRef.current?.getBoundingClientRect()
    const x = rect ? ev.clientX - rect.left : 200
    const y = rect ? ev.clientY - rect.top : 200

    dispatch({
      type: "ADD_NODE",
      workflow: workflow.name,
      node: {
        name,
        label: tmpl.label || "New subagent",
        prompt: "",
        preAction: [],
        postAction: [],
        tools: [],
        stateKeys: [],
        edges: [],
        position: { x, y },
      },
    })
    dispatch({ type: "SELECT_NODE", name })
    dispatch({ type: "SET_TAB", tab: "nodes" })
  }, [dispatch, workflow])

  const addNodeAtCenter = useCallback(() => {
    if (!workflow) return
    const name = uniqueName("newNode")
    const rect = containerRef.current?.getBoundingClientRect()
    const x = rect ? (rect.width || 800) / 2 - NODE_W / 2 : 240
    const y = rect ? (rect.height || 600) / 2 - NODE_H / 2 : 180
    dispatch({
      type: "ADD_NODE",
      workflow: workflow.name,
      node: {
        name,
        label: "New subagent",
        prompt: "",
        preAction: [],
        postAction: [],
        tools: [],
        stateKeys: [],
        edges: [],
        position: { x, y },
      },
    })
    dispatch({ type: "SELECT_NODE", name })
    dispatch({ type: "SET_TAB", tab: "nodes" })
  }, [dispatch, workflow])

  return (
    <section aria-label="canvas" className="flex-1 min-w-0 h-full">
      <div ref={containerRef} className="h-full w-full" onDrop={onDrop} onDragOver={onDragOver}>
        <ReactFlow
          key={`${workflow.name}-${edges.length}`}
          nodes={nodes}
          edges={edges}
          onConnect={onConnect}
          onEdgesDelete={onEdgesDelete}
          onNodeDragStop={onNodeDragStop}
          onSelectionChange={onSelectionChange}
          onEdgeClick={onEdgeClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          defaultEdgeOptions={{ animated: false }}
          snapToGrid
          snapGrid={[10, 10]}
        />
        <button
          className="rounded-md px-2 py-1 bg-primary text-primary-foreground text-xs absolute left-4 bottom-4"
          onClick={addNodeAtCenter}
          aria-label="Add new node"
        >
          + New node
        </button>
      </div>
    </section>
  )
}


// import React, { useCallback } from 'react';
// import {
//   ReactFlow,
//   useNodesState,
//   useEdgesState,
//   addEdge,
//   MiniMap,
//   Controls,
// } from 'reactflow';

// import 'reactflow/dist/base.css';


// import { Handle, Position } from 'reactflow';

// function CustomNode({ data }: any) {
//   return (
//     <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
//       <div className="flex">
//         <div className="rounded-full w-12 h-12 flex justify-center items-center bg-gray-100">
//           {data.emoji}
//         </div>
//         <div className="ml-2">
//           <div className="text-lg font-bold">{data.name}</div>
//           <div className="text-gray-500">{data.job}</div>
//         </div>
//       </div>

//       <Handle
//         type="target"
//         position={Position.Top}
//         className="w-16 !bg-teal-500"
//       />
//       <Handle
//         type="source"
//         position={Position.Bottom}
//         className="w-16 !bg-teal-500"
//       />
//     </div>
//   );
// }



// const nodeTypes = {
//   custom: CustomNode,
// };

// const initNodes = [
//   {
//     id: '1',
//     type: 'custom',
//     data: { name: 'Jane Doe', job: 'CEO', emoji: '😎' },
//     position: { x: 0, y: 50 },
//   },
//   {
//     id: '2',
//     type: 'custom',
//     data: { name: 'Tyler Weary', job: 'Designer', emoji: '🤓' },

//     position: { x: -200, y: 200 },
//   },
//   {
//     id: '3',
//     type: 'custom',
//     data: { name: 'Kristi Price', job: 'Developer', emoji: '🤩' },
//     position: { x: 200, y: 200 },
//   },
// ];

// const initEdges = [
//   {
//     id: 'e1-2',
//     source: '1',
//     target: '2',
//   },
//   {
//     id: 'e1-3',
//     source: '1',
//     target: '3',
//   },
// ];

// export const RightCanvas = () => {
//   const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
//   const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

//   const onConnect = useCallback(
//     (params: any) => setEdges((eds) => addEdge(params, eds)),
//     [],
//   );

//   return (
//     <ReactFlow
//       nodes={nodes}
//       edges={edges}
//       onNodesChange={onNodesChange}
//       onEdgesChange={onEdgesChange}
//       onConnect={onConnect}
//       nodeTypes={nodeTypes}
//       fitView
//       className="bg-teal-50"
//     >
//       <MiniMap />
//       <Controls />
//     </ReactFlow>
//   );
// };

