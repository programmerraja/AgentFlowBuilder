import { useState } from "react"
import { useEditor } from "./store"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export function Topbar() {
  const { exportJSON, importJSON } = useEditor()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")

  const onExport = () => {
    const blob = new Blob([exportJSON()], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "workflows.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const onImport = () => {
    const res = importJSON(text)
    if (res.ok) setOpen(false)
    else alert(res.error)
  }

  return (
    <header className="w-full border-b border-border bg-card">
      <div className="mx-auto max-w-[1200px] px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-balance">Workflow JSON Editor</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onExport} aria-label="Export JSON">
            Export
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button aria-label="Import JSON">Import</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[640px]">
              <DialogHeader>
                <DialogTitle>Import JSON</DialogTitle>
              </DialogHeader>
              <div className="grid gap-2">
                <Label htmlFor="json">Paste your JSON</Label>
                <Textarea
                  id="json"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="{ 'workflows': { ... } }"
                  className="min-h-48"
                />
              </div>
              <DialogFooter className="gap-2">
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={onImport}>Import</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  )
}
