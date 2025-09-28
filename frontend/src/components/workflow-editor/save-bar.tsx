import { useEffect, useState } from "react"
import { useEditor } from "./store"

export function SaveBar() {
  const { state } = useEditor()
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setSaving(true)
    const t = setTimeout(() => setSaving(false), 500)
    return () => clearTimeout(t)
  }, [state.data])

  return (
    <div className="pointer-events-none fixed bottom-3 left-1/2 -translate-x-1/2">
      <div className="pointer-events-auto rounded-md bg-card border px-3 py-2 text-xs shadow-sm">
        {saving ? "Saving…" : "All changes auto-saved"}
      </div>
    </div>
  )
}
