import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from "reactflow"

function truncate(text: string, max = 24) {
  if (!text) return ""
  return text.length > max ? text.slice(0, max - 1) + "…" : text
}

export default function LabeledEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, style, selected, data } =
    props

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  const full = data?.condition ?? data?.label ?? props.label ?? ""
  const short = truncate(full, 24)

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: selected ? "var(--primary)" : "var(--muted-foreground)",
          strokeWidth: selected ? 2.25 : 1.5,
          ...style,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          className={[
            "px-2 py-0.5 rounded-md border text-xs max-w-[180px]",
            "bg-[color:var(--popover)] text-[color:var(--popover-foreground)] border-[color:var(--border)]",
            selected ? "ring-1 ring-(--primary)" : "",
            "shadow-sm",
          ].join(" ")}
          title={full}
        >
          {short || "—"}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
