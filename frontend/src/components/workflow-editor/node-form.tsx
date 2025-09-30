import { useState } from "react"
import type { Workflow, WFNode, Tool, Param, StateKey } from "./types"
import { useEditor } from "./store"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function NodeForm({ workflow, nodeName }: { workflow: Workflow; nodeName: string }) {
  const { state, dispatch } = useEditor()
  const node = workflow.nodes[nodeName]
  const [rename, setRename] = useState(nodeName)

  if (!node) return <div className="text-sm text-muted-foreground">Node not found.</div>

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

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="node-name">Node name</Label>
          <Input id="node-name" value={rename} onChange={(e) => setRename(e.target.value)} />
        </div>
        <Button onClick={doRename} className="mt-6">
          Rename
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="prompt">Prompt</Label>
        <Textarea
          id="prompt"
          value={node.prompt || ""}
          onChange={(e) => saveField({ prompt: e.target.value })}
          className="min-h-28"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Pre / Post Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <TagEditor
            label="preAction"
            values={node.preAction || []}
            onChange={(values) => saveField({ preAction: values })}
          />
          <TagEditor
            label="postAction"
            values={node.postAction || []}
            onChange={(values) => saveField({ postAction: values })}
          />
        </CardContent>
      </Card>

      <ToolsEditor tools={node.tools || []} onChange={(tools) => saveField({ tools })} />

      <StateKeysEditor stateKeys={node.stateKeys || []} onChange={(stateKeys) => saveField({ stateKeys })} />

      <EdgesEditor
        workflow={workflow}
        from={node.name}
        onAdd={(to) => dispatch({ type: "ADD_EDGE", workflow: workflow.name, from: node.name, edge: { to } })}
        onDelete={(to) => dispatch({ type: "DELETE_EDGE", workflow: workflow.name, from: node.name, to })}
        onUpdate={(currentTo, patch) =>
          dispatch({
            type: "UPDATE_EDGE",
            workflow: workflow.name,
            from: node.name,
            to: currentTo,
            patch: { condition: patch.condition },
            newTo: patch.to,
          })
        }
        edges={node.edges || []}
      />

      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => dispatch({ type: "SELECT_NODE", name: undefined })}>
          Back to nodes
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            dispatch({ type: "DELETE_NODE", workflow: workflow.name, nodeName: node.name })
          }}
        >
          Delete Node
        </Button>
      </div>
    </div>
  )
}

function TagEditor({ label, values, onChange }: { label: string; values: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("")
  const add = () => {
    const v = draft.trim()
    if (!v) return
    if (values.includes(v)) return
    onChange([...values, v])
    setDraft("")
  }
  const remove = (v: string) => onChange(values.filter((x) => x !== v))
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`${label} item`} />
        <Button onClick={add}>Add</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-2 rounded-md bg-secondary text-secondary-foreground px-2 py-1 text-xs"
          >
            {v}
            <button className="hover:underline" onClick={() => remove(v)} aria-label={`Remove ${v}`}>
              Remove
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

function ToolsEditor({ tools, onChange }: { tools: Tool[]; onChange: (t: Tool[]) => void }) {
  const [name, setName] = useState("")
  const add = () => {
    const nm = name.trim()
    if (!nm) return
    if (tools.some((t) => t.name === nm)) {
      alert("Tool already exists.")
      return
    }
    onChange([...(tools || []), { name: nm, parameters: [] }])
    setName("")
  }
  const update = (idx: number, patch: Partial<Tool>) => {
    const next = tools.slice()
    next[idx] = { ...next[idx], ...patch }
    onChange(next)
  }
  const remove = (idx: number) => {
    onChange(tools.filter((_, i) => i !== idx))
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tool name e.g. getAvailableSlots"
          />
          <Button onClick={add}>Add</Button>
        </div>
        <div className="space-y-3">
          {tools.map((t, i) => (
            <div key={t.name} className="rounded-md border p-2 space-y-2">
              <div className="flex items-center gap-2">
                <Input value={t.name} onChange={(e) => update(i, { name: e.target.value })} />
                <Button variant="destructive" size="sm" onClick={() => remove(i)}>
                  Delete
                </Button>
              </div>
              <Textarea
                placeholder="Description"
                value={t.description || ""}
                onChange={(e) => update(i, { description: e.target.value })}
              />
              <ParamEditor params={t.parameters || []} onChange={(p) => update(i, { parameters: p })} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ParamEditor({ params, onChange }: { params: Param[]; onChange: (p: Param[]) => void }) {
  const [id, setId] = useState("")
  const [type, setType] = useState("")
  const [req, setReq] = useState(true)
  const add = () => {
    const pid = id.trim()
    if (!pid) return
    onChange([...(params || []), { id: pid, type: type || "string", required: req }])
    setId("")
    setType("")
    setReq(true)
  }
  const remove = (i: number) => onChange(params.filter((_, idx) => idx !== i))
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={id} onChange={(e) => setId(e.target.value)} placeholder="param id" />
        <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="type e.g. string" />
        <Button variant={req ? "default" : "secondary"} onClick={() => setReq((r) => !r)} aria-pressed={req}>
          {req ? "Required" : "Optional"}
        </Button>
        <Button onClick={add}>Add</Button>
      </div>
      <ul className="space-y-1">
        {params.map((p, i) => (
          <li key={`${p.id}-${i}`} className="flex items-center justify-between rounded-md border px-2 py-1 text-sm">
            <span>
              {p.id} — {p.type} {p.required ? "(required)" : ""}
            </span>
            <Button size="sm" variant="destructive" onClick={() => remove(i)}>
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function StateKeysEditor({ stateKeys, onChange }: { stateKeys: StateKey[]; onChange: (s: StateKey[]) => void }) {
  const [id, setId] = useState("")
  const [req, setReq] = useState(false)
  const add = () => {
    const sid = id.trim()
    if (!sid) return
    onChange([...(stateKeys || []), { id: sid, required: req }])
    setId("")
    setReq(false)
  }
  const remove = (i: number) => onChange(stateKeys.filter((_, idx) => idx !== i))
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">State Keys</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Input value={id} onChange={(e) => setId(e.target.value)} placeholder="state key id" />
          <Button variant={req ? "default" : "secondary"} onClick={() => setReq((r) => !r)} aria-pressed={req}>
            {req ? "Required" : "Optional"}
          </Button>
          <Button onClick={add}>Add</Button>
        </div>
        <ul className="space-y-1">
          {stateKeys.map((s, i) => (
            <li key={`${s.id}-${i}`} className="flex items-center justify-between rounded-md border px-2 py-1 text-sm">
              <span>
                {s.id} {s.required ? "(required)" : ""}
              </span>
              <Button size="sm" variant="destructive" onClick={() => remove(i)}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function EdgesEditor({
  workflow,
  from,
  edges,
  onAdd,
  onDelete,
  onUpdate,
}: {
  workflow: Workflow
  from: string
  edges: { to: string; condition?: string }[]
  onAdd: (to: string) => void
  onDelete: (to: string) => void
  onUpdate: (currentTo: string, patch: { to?: string; condition?: string }) => void
}) {
  const [to, setTo] = useState("")
  const nodeNames = Object.keys(workflow.nodes).filter((n) => n !== from)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Edges</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Input list="nodes" value={to} onChange={(e) => setTo(e.target.value)} placeholder="target node name" />
          <datalist id="nodes">
            {nodeNames.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
          <Button
            onClick={() => {
              if (to.trim()) {
                onAdd(to.trim())
                setTo("")
              }
            }}
          >
            Add
          </Button>
        </div>
        <ul className="space-y-2">
          {edges.map((e) => (
            <li key={`${from}->${e.to}`} className="rounded-md border p-2 space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-xs">To</Label>
                <Input
                  value={e.to}
                  onChange={(ev) => onUpdate(e.to, { to: ev.target.value })}
                  className="h-8"
                  placeholder="target node"
                />
                <Button size="sm" variant="destructive" onClick={() => onDelete(e.to)}>
                  Remove
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs">Condition</Label>
                <Input
                  value={e.condition || ""}
                  onChange={(ev) => onUpdate(e.to, { condition: ev.target.value })}
                  className="h-8"
                  placeholder="e.g., if not found after 2 attempts"
                />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
