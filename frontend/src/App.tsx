import { useMemo, useRef, useState, useEffect } from "react"
import { EditorProvider } from "./components/workflow-editor/store"
import { RightCanvas } from "./components/workflow-editor/right-canvas"
import { Topbar } from "./components/workflow-editor/topbar"
import { RightInspector } from "./components/workflow-editor/right-inspector"
import { SaveBar } from "./components/workflow-editor/save-bar"
import './App.css';

const App: React.FC = () => {
  const initial = useMemo(() => undefined, [])

  // Resizable inspector width
  const [inspectorWidth, setInspectorWidth] = useState(558)
  const draggingRef = useRef<{
    startX: number
    startWidth: number
    dragging: boolean
  }>({ startX: 0, startWidth: 360, dragging: false })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current.dragging) return
      const dx = e.clientX - draggingRef.current.startX
      const next = Math.min(640, Math.max(260, draggingRef.current.startWidth - dx)) // right panel on the right side
      setInspectorWidth(next)
    }
    const onUp = () => {
      if (!draggingRef.current.dragging) return
      draggingRef.current.dragging = false
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
  }, [])

  return (
    <main className="h-dvh w-full flex flex-col bg-background text-foreground">
      <EditorProvider initialData={initial}>
        <Topbar />
        <div className="flex-1 flex min-h-0">
          <RightCanvas />
          {/* Resize handle */}
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize inspector panel"
            className="w-1.5 hover:bg-border cursor-col-resize transition-colors"
            onMouseDown={(e) => {
              draggingRef.current = {
                startX: e.clientX,
                startWidth: inspectorWidth,
                dragging: true,
              }
              document.body.style.cursor = "col-resize"
              document.body.style.userSelect = "none"
            }}
          />
          <RightInspector style={{ width: inspectorWidth }} />
        </div>
        <SaveBar />
      </EditorProvider>
    </main>
  )
};

export default App;
