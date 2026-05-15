import { useState } from "react"
import type { Document } from "@/types/document"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"

const TYPES = ["Narrative", "Technical content", "Legal", "Research", "Planning",
  "Financial", "Visual", "Plain language", "Cover page", "Table of contents"]

type Props = { onAdd: (doc: Document) => void }

export function AddForm({ onAdd }: Props) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    header: "", type: "Narrative", status: "In Process" as Document["status"],
    target: "", limit: "", reviewer: ""
  })
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({})


  const handleSubmit = () => {
    onAdd({ ...form, id: Date.now() })
    setForm({ header: "", type: "Narrative", status: "In Process", target: "", limit: "", reviewer: "" })
    setErrors({})
    setOpen(false)
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button><Plus className="h-4 w-4 mr-2" />Add document</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add document</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="col-span-2 space-y-1">
            <Label>Header *</Label>
            <Input value={form.header} onChange={set("header")} placeholder="e.g. Executive Summary" />
            {errors.header && <p className="text-xs text-destructive">{errors.header}</p>}
          </div>
          <div className="space-y-1">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v ?? "Narrative" }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as Document["status"] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Done">Done</SelectItem>
                <SelectItem value="In Process">In Process</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Target *</Label>
            <Input value={form.target} onChange={set("target")} placeholder="e.g. 18" />
            {errors.target && <p className="text-xs text-destructive">{errors.target}</p>}
          </div>
          <div className="space-y-1">
            <Label>Limit</Label>
            <Input value={form.limit} onChange={set("limit")} placeholder="e.g. 5" />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>Reviewer *</Label>
            <Input value={form.reviewer} onChange={set("reviewer")} placeholder="e.g. Eddie Lake" />
            {errors.reviewer && <p className="text-xs text-destructive">{errors.reviewer}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save document</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}