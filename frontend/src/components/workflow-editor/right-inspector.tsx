import type React from "react"

import { useMemo, useState } from "react"
import { useEditor } from "./store"
import type { WFNode, Workflow } from "./types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NodeForm } from "./node-form"

export function RightInspector({ style }: { style?: React.CSSProperties }) {
  const { state, dispatch } = useEditor()
  const [newWF, setNewWF] = useState<{ name: string; description: string }>({ name: "", description: "" })
  const [showWFForm, setShowWFForm] = useState(false)

  const workflows = state.data.workflows
  const selectedWF = state.selectedWorkflow ? workflows[state.selectedWorkflow] : undefined
  const nodes = useMemo(() => (selectedWF ? Object.values(selectedWF.nodes) : []), [selectedWF])

  const onAddWF = () => {
    const name = newWF.name.trim()
    if (!name) return
    if (workflows[name]) {
      alert("Workflow with this name already exists.")
      return
    }
    const wf: Workflow = { name, description: newWF.description, nodes: {} }
    dispatch({ type: "ADD_WORKFLOW", workflow: wf })
    setNewWF({ name: "", description: "" })
    setShowWFForm(false)
  }

  return (
    <aside style={style} className="w-[360px] border-l border-border bg-card flex flex-col min-h-0">
      <Tabs
        value={state.activeTab}
        onValueChange={(v) => dispatch({ type: "SET_TAB", tab: v as any })}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="p-3 border-b border-border">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="nodes">Nodes</TabsTrigger>
          </TabsList>
        </div>

        {/* Workflows Tab: top = scrollable list, bottom = add button + form */}
        <TabsContent value="workflows" className="flex-1 min-h-0 flex flex-col p-0">
          <div className="flex-1 overflow-auto p-3">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Existing</h3>
              <ul className="space-y-1">
                {Object.values(workflows).map((wf) => (
                  <li key={wf.name}>
                    <button
                      className={`w-full text-left rounded-md px-2 py-2 border hover:bg-accent hover:text-accent-foreground ${
                        state.selectedWorkflow === wf.name ? "bg-secondary text-secondary-foreground" : "bg-card"
                      }`}
                      onClick={() => {
                        dispatch({ type: "SELECT_WORKFLOW", name: wf.name })
                        dispatch({ type: "SET_TAB", tab: "nodes" })
                      }}
                      aria-label={`Select workflow ${wf.name}`}
                    >
                      <div className="font-medium">{wf.name}</div>
                      {wf.description ? <div className="text-xs text-muted-foreground">{wf.description}</div> : null}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom action area */}
          <div className="border-t border-border p-3 space-y-2">
            <Button
              variant={showWFForm ? "secondary" : "default"}
              onClick={() => setShowWFForm((s) => !s)}
              aria-expanded={showWFForm}
            >
              {showWFForm ? "Hide Add Workflow" : "Add Workflow"}
            </Button>

            {showWFForm ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Add Workflow</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="wf-name">Name</Label>
                    <Input
                      id="wf-name"
                      value={newWF.name}
                      onChange={(e) => setNewWF((p) => ({ ...p, name: e.target.value }))}
                      placeholder="patientsearch"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="wf-desc">Description</Label>
                    <Textarea
                      id="wf-desc"
                      value={newWF.description}
                      onChange={(e) => setNewWF((p) => ({ ...p, description: e.target.value }))}
                      placeholder="What does this workflow do?"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={onAddWF}>Create</Button>
                    <Button variant="secondary" onClick={() => setShowWFForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="nodes" className="p-3 overflow-auto flex-1">
          {!selectedWF ? (
            <div className="text-sm text-muted-foreground">Select a workflow to manage its nodes.</div>
          ) : state.selectedNode ? (
            <NodeForm workflow={selectedWF} nodeName={state.selectedNode} />
          ) : (
            <div className="space-y-4">
              {/* <Palette workflow={selectedWF} /> */}
              <NodesList workflow={selectedWF} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </aside>
  )
}

function Palette({ workflow }: { workflow: Workflow }) {
  const handleDragStart = (e: React.DragEvent) => {
    const payload = JSON.stringify({ base: "newNode", label: "New subagent" })
    e.dataTransfer.setData("application/x-node-template", payload)
    e.dataTransfer.effectAllowed = "move"
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Node palette</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-xs text-muted-foreground">Drag a “New subagent” onto the canvas or use + button.</div>
        <button
          draggable
          onDragStart={handleDragStart}
          className="rounded-md border px-2 py-2 text-left bg-secondary hover:bg-accent"
          aria-label="Drag new node to canvas"
        >
          + New subagent
        </button>
      </CardContent>
    </Card>
  )
}

function NodesList({ workflow }: { workflow: Workflow }) {
  const { dispatch } = useEditor()
  const [name, setName] = useState("")
  const addNode = () => {
    const nm = name.trim()
    if (!nm) return
    if (workflow.nodes[nm]) {
      alert("Node with this name already exists.")
      return
    }
    const node: WFNode = {
      name: nm,
      label: "New subagent",
      prompt: "",
      preAction: [],
      postAction: [],
      tools: [],
      stateKeys: [],
      edges: [],
      position: { x: 120, y: 120 },
    }
    dispatch({ type: "ADD_NODE", workflow: workflow.name, node })
    dispatch({ type: "SELECT_NODE", name: nm })
    setName("")
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="new-node">New node name</Label>
          <Input
            id="new-node"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="collectIdentifiers"
          />
        </div>
        <Button onClick={addNode} className="mt-6">
          Add
        </Button>
      </div>

      <ul className="space-y-1">
        {Object.values(workflow.nodes).map((n) => (
          <li key={n.name} className="flex items-center justify-between rounded-md border px-2 py-2">
            <button
              className="text-left flex-1 pr-2 hover:underline"
              onClick={() => dispatch({ type: "SELECT_NODE", name: n.name })}
              aria-label={`Edit node ${n.name}`}
            >
              <div className="font-medium">{n.label || n.name}</div>
              <div className="text-xs text-muted-foreground">{n.prompt ? n.prompt.slice(0, 60) : "No prompt"}</div>
            </button>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => dispatch({ type: "SELECT_NODE", name: n.name })}>
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => dispatch({ type: "DELETE_NODE", workflow: workflow.name, nodeName: n.name })}
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
