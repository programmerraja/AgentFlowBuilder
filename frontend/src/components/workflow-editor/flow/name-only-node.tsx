import { Handle, Position, type NodeProps } from "reactflow"
import "reactflow/dist/style.css"

type NameOnlyData = {
  name?: string
}

export default function NameOnlyNode({ data, selected }: NodeProps<NameOnlyData>) {
  const name = data?.name || (data as any)?.label || "Untitled"

  return (
    <div
      className={[
        "rounded-md border px-3 py-1.5 text-sm font-medium",
        "bg-(--card) text-(--card-foreground) border-(--border)",
        selected ? "ring-2 ring-(--primary)" : "ring-0",
        "shadow-sm",
      ].join(" ")}
      role="group"
      aria-label={name}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-(--muted-foreground)" />
      <div className="truncate max-w-[200px]" title={name}>
        {name}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-(--muted-foreground)" />
    </div>
  )
}
