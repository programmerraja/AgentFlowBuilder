import type React from 'react';

import { useMemo, useState, useCallback } from 'react';
import { useEditor } from './store';
import type { WFNode, Workflow } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NodeForm } from './node-form';

export function RightInspector({ style }: { style?: React.CSSProperties }) {
  const { state, dispatch } = useEditor();
  const [newWF, setNewWF] = useState<{ name: string; description: string }>({
    name: '',
    description: '',
  });
  const [showWFForm, setShowWFForm] = useState(false);

  const workflows = state.data.workflows;
  const selectedWF = state.selectedWorkflow
    ? workflows[state.selectedWorkflow]
    : undefined;
  const nodes = useMemo(
    () => (selectedWF ? Object.values(selectedWF.nodes) : []),
    [selectedWF]
  );

  const onAddWF = () => {
    const name = newWF.name.trim();
    if (!name) return;
    if (workflows[name]) {
      alert('Workflow with this name already exists.');
      return;
    }
    const wf: Workflow = { name, description: newWF.description, nodes: {} };
    dispatch({ type: 'ADD_WORKFLOW', workflow: wf });
    setNewWF({ name: '', description: '' });
    setShowWFForm(false);
  };

  return (
    <aside
      style={style}
      className="w-[558px] border-l border-border bg-card flex flex-col min-h-0"
    >
      <Tabs
        value={state.activeTab}
        onValueChange={v => dispatch({ type: 'SET_TAB', tab: v as any })}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="p-3 border-b border-border">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="nodes">Nodes</TabsTrigger>
          </TabsList>
        </div>

        {/* Workflows Tab: top = scrollable list, bottom = add button + form */}
        <TabsContent
          value="workflows"
          className="flex-1 min-h-0 flex flex-col p-0"
        >
          <div className="flex-1 overflow-auto p-3">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Existing</h3>
              <ul className="space-y-1">
                {Object.values(workflows).map(wf => (
                  <li key={wf.name}>
                    <button
                      className={`w-full text-left rounded-md px-2 py-2 border hover:bg-accent hover:text-accent-foreground ${
                        state.selectedWorkflow === wf.name
                          ? 'bg-secondary text-secondary-foreground'
                          : 'bg-card'
                      }`}
                      onClick={() => {
                        dispatch({ type: 'SELECT_WORKFLOW', name: wf.name });
                        dispatch({ type: 'SET_TAB', tab: 'nodes' });
                      }}
                      aria-label={`Select workflow ${wf.name}`}
                    >
                      <div className="font-medium">{wf.name}</div>
                      {wf.description ? (
                        <div className="text-xs text-muted-foreground">
                          {wf.description}
                        </div>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom action area */}
          <div className="border-t border-border p-3 space-y-2">
            {!showWFForm ? (
              <Button
                variant={showWFForm ? 'secondary' : 'default'}
                onClick={() => setShowWFForm(s => !s)}
                aria-expanded={showWFForm}
              >
                Add Workflow
              </Button>
            ) : (
              <></>
            )}

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
                      onChange={e =>
                        setNewWF(p => ({ ...p, name: e.target.value }))
                      }
                      placeholder="patientsearch"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="wf-desc">Description</Label>
                    <Textarea
                      id="wf-desc"
                      value={newWF.description}
                      onChange={e =>
                        setNewWF(p => ({ ...p, description: e.target.value }))
                      }
                      placeholder="What does this workflow do?"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={onAddWF}>Create</Button>
                    <Button
                      variant="secondary"
                      onClick={() => setShowWFForm(false)}
                    >
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
            <div className="text-sm text-muted-foreground">
              Select a workflow to manage its nodes.
            </div>
          ) : state.selectedNode ? (
            <NodeTabs workflow={selectedWF} nodeName={state.selectedNode} />
          ) : (
            <div className="space-y-4">
              {/* <Palette workflow={selectedWF} /> */}
              <NodesList workflow={selectedWF} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </aside>
  );
}

function Palette({ workflow }: { workflow: Workflow }) {
  const handleDragStart = (e: React.DragEvent) => {
    const payload = JSON.stringify({ base: 'newNode', label: 'New subagent' });
    e.dataTransfer.setData('application/x-node-template', payload);
    e.dataTransfer.effectAllowed = 'move';
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Node palette</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-xs text-muted-foreground">
          Drag a “New subagent” onto the canvas or use + button.
        </div>
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
  );
}

function NodesList({ workflow }: { workflow: Workflow }) {
  const { dispatch } = useEditor();
  const [name, setName] = useState('');
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOverNode, setDragOverNode] = useState<string | null>(null);

  const addNode = () => {
    const nm = name.trim();
    if (!nm) return;
    if (workflow.nodes[nm]) {
      alert('Node with this name already exists.');
      return;
    }
    const node: WFNode = {
      name: nm,
      label: 'New subagent',
      prompt: '',
      preAction: [],
      postAction: [],
      tools: [],
      stateKeys: [],
      edges: [],
      position: { x: 120, y: 120 },
    };
    dispatch({ type: 'ADD_NODE', workflow: workflow.name, node });
    dispatch({ type: 'SELECT_NODE', name: nm });
    setName('');
  };

  // Get ordered list of nodes using nodeOrder array
  const orderedNodes = useMemo(() => {
    const nodeOrder = workflow.nodeOrder || Object.keys(workflow.nodes);
    
    // Create ordered array based on nodeOrder
    const ordered = nodeOrder
      .map(nodeName => workflow.nodes[nodeName])
      .filter(Boolean); // Remove any undefined nodes
    
    return ordered;
  }, [workflow.nodes, workflow.nodeOrder]);

  const handleDragStart = useCallback((e: React.DragEvent, nodeName: string) => {
    setDraggedNode(nodeName);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', nodeName);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, nodeName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverNode(nodeName);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverNode(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetNodeName: string) => {
    e.preventDefault();
    const draggedNodeName = e.dataTransfer.getData('text/plain');
    
    if (draggedNodeName && draggedNodeName !== targetNodeName) {
      // Create new order by moving dragged node to target position
      const currentOrder = orderedNodes.map(n => n.name);
      const draggedIndex = currentOrder.indexOf(draggedNodeName);
      const targetIndex = currentOrder.indexOf(targetNodeName);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newOrder = [...currentOrder];
        newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, draggedNodeName);
        
        dispatch({ 
          type: 'REORDER_NODES', 
          workflow: workflow.name, 
          nodeOrder: newOrder 
        });
      }
    }
    
    setDraggedNode(null);
    setDragOverNode(null);
  }, [dispatch, workflow.name, orderedNodes]);

  const handleDragEnd = useCallback(() => {
    setDraggedNode(null);
    setDragOverNode(null);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="new-node">New node name</Label>
          <Input
            id="new-node"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="collectIdentifiers"
          />
        </div>
        <Button onClick={addNode} className="mt-6">
          Add
        </Button>
      </div>

      <div className="text-xs text-muted-foreground mb-2">
        Drag nodes to reorder
        {draggedNode && <span className="ml-2 text-primary">Dragging: {draggedNode}</span>}
      </div>

      <ul className="space-y-1">
        {orderedNodes.map((n, index) => (
          <li
            key={n.name}
            draggable={!n.isFirstNode} // First node cannot be dragged
            onDragStart={!n.isFirstNode ? (e) => handleDragStart(e, n.name) : undefined}
            onDragOver={(e) => handleDragOver(e, n.name)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, n.name)}
            onDragEnd={handleDragEnd}
            className={`flex items-center justify-between rounded-md border px-2 py-2 transition-colors ${
              draggedNode === n.name 
                ? 'opacity-50' 
                : dragOverNode === n.name 
                ? 'bg-accent border-primary' 
                : 'hover:bg-accent'
            } ${n.isFirstNode ? 'cursor-default' : 'cursor-move'}`}
          >
            <div className="flex items-center gap-2 flex-1">
              {/* {!n.isFirstNode && ( */}
                <div className="text-muted-foreground cursor-move">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M3 12h18M3 18h18"/>
                  </svg>
                </div>
              {/* )} */}
              <div
                className="text-left flex-1 cursor-pointer"
                onClick={() => dispatch({ type: 'SELECT_NODE', name: n.name })}
              >
                <div className="font-medium flex items-center gap-2">
                  {/* {n.isFirstNode && <span className="text-xs bg-primary text-primary-foreground px-1 rounded">START</span>} */}
                  {n.label || n.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {n.prompt ? n.prompt.slice(0, 60) : 'No prompt'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => dispatch({ type: 'SELECT_NODE', name: n.name })}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  dispatch({
                    type: 'DELETE_NODE',
                    workflow: workflow.name,
                    nodeName: n.name,
                  })
                }
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NodeTabs({ workflow, nodeName }: { workflow: Workflow; nodeName: string }) {
  const { state, dispatch } = useEditor()
  const [activeTab, setActiveTab] = useState("basic")

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="node-name">Node name</Label>
          <Input id="node-name" value={nodeName} readOnly className="bg-muted" />
        </div>
        <Button 
          variant="outline" 
          onClick={() => dispatch({ type: "SELECT_NODE", name: undefined })}
        >
          Back
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="edges">Edges</TabsTrigger>
          <TabsTrigger value="states">States</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-4">
          <BasicEditor workflow={workflow} nodeName={nodeName} />
        </TabsContent>

        <TabsContent value="tools" className="mt-4">
          <ToolsEditor workflow={workflow} nodeName={nodeName} />
        </TabsContent>

        <TabsContent value="edges" className="mt-4">
          <EdgesEditor workflow={workflow} nodeName={nodeName} />
        </TabsContent>

        <TabsContent value="states" className="mt-4">
          <StatesEditor workflow={workflow} nodeName={nodeName} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BasicEditor({ workflow, nodeName }: { workflow: Workflow; nodeName: string }) {
  const { dispatch } = useEditor()
  const node = workflow.nodes[nodeName]
  const [rename, setRename] = useState(nodeName)

  const saveField = (patch: Partial<WFNode>) =>
    dispatch({ type: "UPDATE_NODE", workflow: workflow.name, nodeName, node: patch })

  const doRename = () => {
    const newName = rename.trim()
    if (!newName || newName === nodeName) return
    if (workflow.nodes[newName]) {
      alert("Another node already has that name.")
      return
    }
    dispatch({ type: "RENAME_NODE", workflow: workflow.name, oldName: nodeName, newName })
  }

  const [preAction, setPreAction] = useState("")
  const [postAction, setPostAction] = useState("")

  const addPreAction = () => {
    if (!preAction.trim()) return
    const actions = [...(node.preAction || []), preAction.trim()]
    saveField({ preAction: actions })
    setPreAction("")
  }

  const addPostAction = () => {
    if (!postAction.trim()) return
    const actions = [...(node.postAction || []), postAction.trim()]
    saveField({ postAction: actions })
    setPostAction("")
  }

  const removePreAction = (index: number) => {
    const actions = (node.preAction || []).filter((_, i) => i !== index)
    saveField({ preAction: actions })
  }

  const removePostAction = (index: number) => {
    const actions = (node.postAction || []).filter((_, i) => i !== index)
    saveField({ postAction: actions })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="node-name">Node name</Label>
          <Input id="node-name" value={rename} onChange={(e) => setRename(e.target.value)} />
        </div>
        <Button onClick={doRename}>
          Rename
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="prompt">Prompt</Label>
        <Textarea
          id="prompt"
          value={node.prompt || ""}
          onChange={(e) => saveField({ prompt: e.target.value })}
          placeholder="Enter the prompt for this node..."
          rows={4}
        />
      </div>


      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Pre Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Pre action item"
              value={preAction}
              onChange={(e) => setPreAction(e.target.value)}
            />
            <Button onClick={addPreAction}>Add</Button>
          </div>
          <div className="space-y-1">
            {(node.preAction || []).map((action, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                <span className="text-sm">{action}</span>
                <Button size="sm" variant="destructive" onClick={() => removePreAction(index)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Post Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Post action item"
              value={postAction}
              onChange={(e) => setPostAction(e.target.value)}
            />
            <Button onClick={addPostAction}>Add</Button>
          </div>
          <div className="space-y-1">
            {(node.postAction || []).map((action, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                <span className="text-sm">{action}</span>
                <Button size="sm" variant="destructive" onClick={() => removePostAction(index)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ToolsEditor({ workflow, nodeName }: { workflow: Workflow; nodeName: string }) {
  const { dispatch } = useEditor()
  const node = workflow.nodes[nodeName]
  const [newTool, setNewTool] = useState({ name: "", description: "" })
  const [editingTool, setEditingTool] = useState<number | null>(null)

  const addTool = () => {
    if (!newTool.name.trim()) return
    const tools = [...(node.tools || []), { 
      name: newTool.name, 
      description: newTool.description,
      parameters: []
    }]
    dispatch({ type: "UPDATE_NODE", workflow: workflow.name, nodeName, node: { tools } })
    setNewTool({ name: "", description: "" })
  }

  const removeTool = (index: number) => {
    const tools = (node.tools || []).filter((_, i) => i !== index)
    dispatch({ type: "UPDATE_NODE", workflow: workflow.name, nodeName, node: { tools } })
  }

  const updateTool = (index: number, field: string, value: any) => {
    const tools = [...(node.tools || [])]
    tools[index] = { ...tools[index], [field]: value }
    dispatch({ type: "UPDATE_NODE", workflow: workflow.name, nodeName, node: { tools } })
  }

  const addParameter = (toolIndex: number) => {
    const tools = [...(node.tools || [])]
    tools[toolIndex] = {
      ...tools[toolIndex],
      parameters: [...(tools[toolIndex].parameters || []), { id: "", type: "string", required: false }]
    }
    dispatch({ type: "UPDATE_NODE", workflow: workflow.name, nodeName, node: { tools } })
  }

  const removeParameter = (toolIndex: number, paramIndex: number) => {
    const tools = [...(node.tools || [])]
    tools[toolIndex] = {
      ...tools[toolIndex],
      parameters: (tools[toolIndex].parameters || []).filter((_, i) => i !== paramIndex)
    }
    dispatch({ type: "UPDATE_NODE", workflow: workflow.name, nodeName, node: { tools } })
  }

  const updateParameter = (toolIndex: number, paramIndex: number, field: string, value: any) => {
    const tools = [...(node.tools || [])]
    const parameters = [...(tools[toolIndex].parameters || [])]
    parameters[paramIndex] = { ...parameters[paramIndex], [field]: value }
    tools[toolIndex] = { ...tools[toolIndex], parameters }
    dispatch({ type: "UPDATE_NODE", workflow: workflow.name, nodeName, node: { tools } })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Tool name"
              value={newTool.name}
              onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
            />
            <Input
              placeholder="Description (optional)"
              value={newTool.description}
              onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
            />
            <Button onClick={addTool}>Add</Button>
          </div>
        </div>

        <div className="space-y-4">
          {(node.tools || []).map((tool, toolIndex) => (
            <div key={toolIndex} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    value={tool.name}
                    onChange={(e) => updateTool(toolIndex, "name", e.target.value)}
                    className="font-medium"
                    placeholder="Tool name"
                  />
                </div>
                <Button size="sm" variant="destructive" onClick={() => removeTool(toolIndex)}>
                  Remove
                </Button>
              </div>

              <div>
                <Input
                  value={tool.description || ""}
                  onChange={(e) => updateTool(toolIndex, "description", e.target.value)}
                  placeholder="Tool description"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Parameters</Label>
                  <Button size="sm" onClick={() => addParameter(toolIndex)}>
                    Add Parameter
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {(tool.parameters || []).map((param, paramIndex) => (
                    <div key={paramIndex} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Input
                        value={param.id}
                        onChange={(e) => updateParameter(toolIndex, paramIndex, "id", e.target.value)}
                        placeholder="Parameter ID"
                        className="flex-1"
                      />
                      <Input
                        value={param.type}
                        onChange={(e) => updateParameter(toolIndex, paramIndex, "type", e.target.value)}
                        placeholder="Type"
                        className="w-24"
                      />
                      <Button
                        size="sm"
                        variant={param.required ? "default" : "outline"}
                        onClick={() => updateParameter(toolIndex, paramIndex, "required", !param.required)}
                      >
                        {param.required ? "Required" : "Optional"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeParameter(toolIndex, paramIndex)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function EdgesEditor({ workflow, nodeName }: { workflow: Workflow; nodeName: string }) {
  const { dispatch } = useEditor()
  const node = workflow.nodes[nodeName]
  const [newEdge, setNewEdge] = useState({ to: "", condition: "" })

  const addEdge = () => {
    if (!newEdge.to.trim()) return
    const edges = [...(node.edges || []), { to: newEdge.to, condition: newEdge.condition }]
    dispatch({ type: "UPDATE_NODE", workflow: workflow.name, nodeName, node: { edges } })
    setNewEdge({ to: "", condition: "" })
  }

  const removeEdge = (index: number) => {
    const edges = (node.edges || []).filter((_, i) => i !== index)
    dispatch({ type: "UPDATE_NODE", workflow: workflow.name, nodeName, node: { edges } })
  }

  const updateEdge = (index: number, field: string, value: string) => {
    const edges = [...(node.edges || [])]
    edges[index] = { ...edges[index], [field]: value }
    dispatch({ type: "UPDATE_NODE", workflow: workflow.name, nodeName, node: { edges } })
  }

  const availableNodes = Object.keys(workflow.nodes).filter(n => n !== nodeName)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Edges</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Target node"
            value={newEdge.to}
            onChange={(e) => setNewEdge({ ...newEdge, to: e.target.value })}
            list="nodes"
          />
          <datalist id="nodes">
            {availableNodes.map(n => <option key={n} value={n} />)}
          </datalist>
          <Button onClick={addEdge}>Add</Button>
        </div>
        <div className="space-y-2">
          {(node.edges || []).map((edge, index) => (
            <div key={index} className="p-2 border rounded space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-xs">To</Label>
                <Input
                  value={edge.to}
                  onChange={(e) => updateEdge(index, "to", e.target.value)}
                  className="h-8"
                />
                <Button size="sm" variant="destructive" onClick={() => removeEdge(index)}>
                  Remove
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs">Condition</Label>
                <Input
                  value={edge.condition || ""}
                  onChange={(e) => updateEdge(index, "condition", e.target.value)}
                  className="h-8"
                  placeholder="e.g., if not found after 2 attempts"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function StatesEditor({ workflow, nodeName }: { workflow: Workflow; nodeName: string }) {
  const { dispatch } = useEditor()
  const node = workflow.nodes[nodeName]
  const [newState, setNewState] = useState({ id: "", required: false, description: "" })

  const addState = () => {
    if (!newState.id.trim()) return
    const stateKeys = [...(node.stateKeys || []), { 
      id: newState.id, 
      required: newState.required,
      description: newState.description 
    }]
    dispatch({ type: "UPDATE_NODE", workflow: workflow.name, nodeName, node: { stateKeys } })
    setNewState({ id: "", required: false, description: "" })
  }

  const removeState = (index: number) => {
    const stateKeys = (node.stateKeys || []).filter((_, i) => i !== index)
    dispatch({ type: "UPDATE_NODE", workflow: workflow.name, nodeName, node: { stateKeys } })
  }

  const updateState = (index: number, field: string, value: any) => {
    const stateKeys = [...(node.stateKeys || [])]
    stateKeys[index] = { ...stateKeys[index], [field]: value }
    dispatch({ type: "UPDATE_NODE", workflow: workflow.name, nodeName, node: { stateKeys } })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">State Keys</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="State key id"
            value={newState.id}
            onChange={(e) => setNewState({ ...newState, id: e.target.value })}
          />
          <Button 
            variant={newState.required ? "default" : "outline"}
            onClick={() => setNewState({ ...newState, required: !newState.required })}
          >
            {newState.required ? "Required" : "Optional"}
          </Button>
          <Button onClick={addState}>Add</Button>
        </div>
        <div className="space-y-2">
          {(node.stateKeys || []).map((state, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border rounded">
              <div className="flex-1">
                <div className="font-medium">
                  {state.id} {state.required && "(required)"}
                </div>
                {state.description && <div className="text-sm text-muted-foreground">{state.description}</div>}
              </div>
              <Button size="sm" variant="destructive" onClick={() => removeState(index)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
