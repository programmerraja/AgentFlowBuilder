"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useEditor } from "./store"
import type { WFNode } from "./types"
import { BackgroundVariant } from "reactflow"

// --- Shared types/consts ---
type Point = { x: number; y: number }
const NODE_W = 220
const NODE_H = 52

// --- ReactFlow Types (lazy loaded) ---
type RFModule = typeof import("reactflow")
type RFNode = import("reactflow").Node
type RFEdge = import("reactflow").Edge

export function RightCanvas() {
  const { state, dispatch } = useEditor()
  const wfName = state.selectedWorkflow
  const workflow = wfName ? state.data.workflows[wfName] : undefined

  const [rf, setRf] = useState<RFModule | null>(null)
  const [rfCssLoaded, setRfCssLoaded] = useState(false)

  // Try to load React Flow dynamically. If it fails, we will render the fallback.
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const mod = await import("reactflow")
        if (!mounted) return
        setRf(mod)

        // Load minimal CSS via CDN to avoid node_modules CSS MIME issues in preview
        const id = "rf-style-cdn"
        if (!document.getElementById(id)) {
          const link = document.createElement("link")
          link.id = id
          link.rel = "stylesheet"
          link.href = "https://unpkg.com/reactflow@11.11.4/dist/style.css"
          link.onload = () => setRfCssLoaded(true)
          link.onerror = () => setRfCssLoaded(true) // proceed even if it fails; we apply minimal inline styles
          document.head.appendChild(link)
        } else {
          setRfCssLoaded(true)
        }
      } catch (e) {
        // Keep rf as null → fallback view renders
        // console.log("[v0] ReactFlow load failed:", e)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  if (!workflow) {
    return (
      <section aria-label="canvas" className="flex-1 min-w-0 h-full flex items-center justify-center bg-muted">
        <p className="text-sm text-muted-foreground">Select a workflow to view and edit its graph.</p>
      </section>
    )
  }

  // If reactflow loaded, render the RF view, else fallback
  return rf ? <ReactFlowView rf={rf} rfCssLoaded={rfCssLoaded} /> : <FallbackCanvas />
}

// ============ ReactFlow Renderer (primary path) ============
function ReactFlowView({ rf, rfCssLoaded }: { rf: RFModule; rfCssLoaded: boolean }) {
  const { state, dispatch } = useEditor()
  const workflow = state.selectedWorkflow ? state.data.workflows[state.selectedWorkflow] : undefined
  const ReactFlow = rf.default
  const { Background, Controls, MiniMap, MarkerType, Panel } = rf
  const containerRef = useRef<HTMLDivElement>(null)

  const derived = useMemo(() => {
    if (!workflow) return { nodes: [] as RFNode[], edges: [] as RFEdge[] }

    const wfNodes = Object.values(workflow.nodes)
    const fallbackPos = (idx: number) => {
      const col = idx % 3
      const row = Math.floor(idx / 3)
      return { x: 80 + col * (NODE_W + 80), y: 80 + row * (NODE_H + 100) }
    }

    const truncate = (t?: string, n = 24) => {
      if (!t) return ""
      return t.length > n ? `${t.slice(0, n)}…` : t
    }

    const nodes: RFNode[] = wfNodes.map((n, i) => {
      const pos = n.position || fallbackPos(i)
      return {
        id: n.name,
        position: pos,
        data: {
          label: <div className="text-sm font-medium truncate leading-none py-1">{n.name}</div>,
        },
        style: {
          width: NODE_W,
          height: NODE_H,
          border: "1px solid var(--border)",
          background: "var(--card)",
          color: "var(--foreground)",
          borderRadius: 10,
          boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
          padding: 8,
        },
        draggable: true,
        selectable: true,
        type: "default",
      }
    })

    const edges: RFEdge[] = []
    wfNodes.forEach((n) => {
      ;(n.edges || []).forEach((e, idx) => {
        const condition = truncate(e.condition, 24)
        edges.push({
          id: `${n.name}->${e.to}-${idx}`,
          source: n.name,
          target: e.to,
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
          label: condition,
          labelStyle: { fill: "var(--foreground)", fontSize: 11, fontWeight: 500 },
          labelBgStyle: { fill: "var(--secondary)", color: "var(--foreground)", stroke: "var(--border)" },
          labelBgPadding: [2, 6],
          labelBgBorderRadius: 6,
          style: { stroke: "var(--muted-foreground)", strokeWidth: 1.75 },
        })
      })
    })
    return { nodes, edges }
  }, [workflow, rf])

  const onConnect = useCallback(
    (connection: any) => {
      if (!workflow || !connection.source || !connection.target) return
      if (connection.source === connection.target) return
      const from = connection.source
      const to = connection.target
      const exists = (workflow.nodes[from]?.edges || []).some((e) => e.to === to)
      if (!exists) {
        dispatch({ type: "ADD_EDGE", workflow: workflow.name, from, edge: { to } })
      }
    },
    [dispatch, workflow],
  )

  const onEdgesDelete = useCallback(
    (deleted: RFEdge[]) => {
      if (!workflow) return
      deleted.forEach((e) => {
        if (e.source && e.target) {
          dispatch({ type: "DELETE_EDGE", workflow: workflow.name, from: e.source, to: e.target })
        }
      })
    },
    [dispatch, workflow],
  )

  const onNodeDragStop = useCallback(
    (_: any, node: any) => {
      if (!workflow) return
      dispatch({
        type: "SET_POSITION",
        workflow: workflow.name,
        nodeName: node.id,
        position: { x: node.position.x, y: node.position.y },
      })
    },
    [dispatch, workflow],
  )

  const onSelectionChange = useCallback(
    ({ nodes }: { nodes: RFNode[]; edges: RFEdge[] }) => {
      if (!workflow) return
      if (nodes.length === 1) {
        dispatch({ type: "SELECT_NODE", name: nodes[0].id })
        dispatch({ type: "SET_TAB", tab: "nodes" })
      }
    },
    [dispatch, workflow],
  )

  const onEdgeClick = useCallback(
    (_: any, edge: RFEdge) => {
      if (!workflow) return
      if (edge.source) {
        dispatch({ type: "SELECT_NODE", name: edge.source })
        dispatch({ type: "SET_TAB", tab: "nodes" })
      }
    },
    [dispatch, workflow],
  )

  // support drag-and-drop from right-inspector palette
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

  const onDrop = useCallback(
    (ev: React.DragEvent) => {
      if (!workflow) return
      ev.preventDefault()
      const raw =
        ev.dataTransfer.getData("application/x-node-template") || ev.dataTransfer.getData("application/reactflow") || ""
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
    },
    [dispatch, workflow],
  )

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
        {!rfCssLoaded ? (
          <style
            dangerouslySetInnerHTML={{
              __html: `
                .react-flow { width: 100%; height: 100%; }
                .react-flow__panel { background: var(--card); color: var(--foreground); }
                .react-flow__edge-path { stroke: var(--muted-foreground); stroke-width: 1.75; }
                .react-flow__handle { background: var(--muted-foreground); width: 8px; height: 8px; }
              `,
            }}
          />
        ) : null}
        <ReactFlow
          nodes={derived.nodes}
          edges={derived.edges}
          onConnect={onConnect}
          onEdgesDelete={onEdgesDelete}
          onNodesChange={(changes: any[]) => {
            const wf = state.selectedWorkflow ? state.data.workflows[state.selectedWorkflow] : undefined
            if (!wf) return
            for (const c of changes) {
              if (c.type === "position" && c.id && c.position) {
                dispatch({
                  type: "SET_POSITION",
                  workflow: wf.name,
                  nodeName: c.id,
                  position: { x: c.position.x, y: c.position.y },
                })
              }
            }
          }}
          onNodeDragStop={onNodeDragStop}
          onSelectionChange={onSelectionChange}
          onEdgeClick={onEdgeClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          defaultEdgeOptions={{ animated: false }}
          snapToGrid
          snapGrid={[10, 10]}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          <MiniMap pannable zoomable maskColor="rgba(0,0,0,0.06)" />
          <Controls showInteractive={true} />
          <Panel position="top-right" className="text-xs px-2 py-1 bg-card border rounded-md">
            {workflow?.name}
          </Panel>
          <Panel position="bottom-left" className="p-2">
            <button
              className="rounded-md px-2 py-1 bg-primary text-primary-foreground text-xs"
              onClick={addNodeAtCenter}
              aria-label="Add new node"
            >
              + New node
            </button>
          </Panel>
        </ReactFlow>
      </div>
    </section>
  )
}

// ============ Fallback SVG/HTML canvas (works without reactflow) ============
function FallbackCanvas() {
  const { state, dispatch } = useEditor()
  const workflow = state.selectedWorkflow ? state.data.workflows[state.selectedWorkflow] : undefined
  const containerRef = useRef<HTMLDivElement>(null)

  const nodes = useMemo(() => (workflow ? Object.values(workflow.nodes) : ([] as WFNode[])), [workflow])

  const edges = useMemo(() => {
    if (!workflow) return [] as { from: string; to: string; condition?: string }[]
    const list: { from: string; to: string; condition?: string }[] = []
    Object.values(workflow.nodes).forEach((n) => {
      ;(n.edges || []).forEach((e) => list.push({ from: n.name, to: e.to, condition: e.condition }))
    })
    return list
  }, [workflow])

  const positions = useMemo(() => {
    const map = new Map<string, Point>()
    nodes.forEach((n, i) => {
      const fallback = { x: 80 + (i % 3) * (NODE_W + 80), y: 80 + Math.floor(i / 3) * (NODE_H + 100) }
      const p = n.position || fallback
      map.set(n.name, p)
    })
    return map
  }, [nodes])

  const toCenter = (p?: Point) => ({ x: (p?.x ?? 0) + NODE_W / 2, y: (p?.y ?? 0) + NODE_H / 2 })

  const onSelectNode = useCallback(
    (name: string) => {
      dispatch({ type: "SELECT_NODE", name })
      dispatch({ type: "SET_TAB", tab: "nodes" })
    },
    [dispatch],
  )

  const startDrag = useCallback(
    (name: string, ev: React.PointerEvent<HTMLDivElement>) => {
      const container = containerRef.current
      if (!container || !workflow) return
      const rect = container.getBoundingClientRect()
      const nodePos = positions.get(name) || { x: 80, y: 80 }
      const offsetX = ev.clientX - (rect.left + nodePos.x)
      const offsetY = ev.clientY - (rect.top + nodePos.y)

      const onMove = (e: PointerEvent) => {
        const x = Math.max(0, e.clientX - rect.left - offsetX)
        const y = Math.max(0, e.clientY - rect.top - offsetY)
        dispatch({ type: "SET_POSITION", workflow: workflow.name, nodeName: name, position: { x, y } })
      }
      const onUp = () => {
        window.removeEventListener("pointermove", onMove)
        window.removeEventListener("pointerup", onUp, true)
      }
      window.addEventListener("pointermove", onMove)
      window.addEventListener("pointerup", onUp, true)
    },
    [dispatch, positions, workflow],
  )

  const truncate = (t?: string, n = 24) => (t ? (t.length > n ? `${t.slice(0, n)}…` : t) : "")

  if (!workflow) return null

  return (
    <section aria-label="canvas" className="flex-1 min-w-0 h-full">
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-auto bg-secondary/30"
        style={{ outline: "1px solid var(--border)" }}
      >
        <svg width={1600} height={1200} className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted-foreground)" />
            </marker>
          </defs>
          {edges.map((e, i) => {
            const sp = toCenter(positions.get(e.from))
            const tp = toCenter(positions.get(e.to))
            const midX = (sp.x + tp.x) / 2
            const midY = (sp.y + tp.y) / 2
            return (
              <g key={`${e.from}->${e.to}-${i}`}>
                <line
                  x1={sp.x}
                  y1={sp.y}
                  x2={tp.x}
                  y2={tp.y}
                  stroke="var(--muted-foreground)"
                  strokeWidth={2}
                  markerEnd="url(#arrow)"
                />
                <rect
                  x={midX - 48}
                  y={midY - 10}
                  rx={6}
                  ry={6}
                  width={96}
                  height={20}
                  fill="var(--secondary)"
                  stroke="var(--border)"
                />
                <text x={midX} y={midY + 4} textAnchor="middle" fontSize="11" fill="var(--foreground)">
                  {truncate(e.condition)}
                </text>
              </g>
            )
          })}
        </svg>

        <div style={{ width: 1600, height: 1200, position: "relative" }}>
          {nodes.map((n) => {
            const p = positions.get(n.name) || { x: 80, y: 80 }
            return (
              <div
                key={n.name}
                role="button"
                tabIndex={0}
                onClick={() => onSelectNode(n.name)}
                onPointerDown={(e) => startDrag(n.name, e)}
                className="absolute select-none"
                style={{
                  left: p.x,
                  top: p.y,
                  width: NODE_W,
                  height: NODE_H,
                  background: "var(--card)",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
                  padding: 8,
                  cursor: "grab",
                }}
                aria-label={`Node ${n.name}`}
              >
                <div className="text-sm font-medium truncate leading-none py-1">{n.name}</div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="absolute right-3 top-3 text-xs rounded-md bg-card border px-2 py-1">
        Running fallback canvas (React Flow unavailable in preview). Publish to use React Flow.
      </div>
    </section>
  )
}
