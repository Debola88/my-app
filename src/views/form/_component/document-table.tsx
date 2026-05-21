import { useState, useMemo } from "react"
import type { Document } from "@/types/document"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Trash2, ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Eye, Edit } from "lucide-react"

type SortKey = keyof Document
type SortDir = "asc" | "desc"

type Props = {
  data: Document[]
  onDelete: (id: number) => void
}

const PAGE_SIZE = 10

export function DocumentTable({ data, onDelete }: Props) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortKey, setSortKey] = useState<SortKey>("id")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [page, setPage] = useState(1)
  const [viewDialog, setViewDialog] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)

  const types = useMemo(() => ["all", ...Array.from(new Set(data.map(d => d.type))).sort()], [data])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("asc") }
    setPage(1)
  }

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />
    return sortDir === "asc"
      ? <ArrowUp className="ml-1 h-3 w-3" />
      : <ArrowDown className="ml-1 h-3 w-3" />
  }
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return data
      .filter(d => {
        if (q && !d.header.toLowerCase().includes(q) && !d.reviewer.toLowerCase().includes(q)) return false
        if (statusFilter !== "all" && d.status !== statusFilter) return false
        if (typeFilter !== "all" && d.type !== typeFilter) return false
        return true
      })
      .sort((a, b) => {
        let av: string | number = (a[sortKey] ?? "") as string | number
        let bv: string | number = (b[sortKey] ?? "") as string | number
        if (sortKey === "target" || sortKey === "limit" || sortKey === "id") {
          av = Number(av); bv = Number(bv)
        }
        if (av < bv) return sortDir === "asc" ? -1 : 1
        if (av > bv) return sortDir === "asc" ? 1 : -1
        return 0
      })
  }, [data, search, statusFilter, typeFilter, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const SortableHead = ({ label, k }: { label: string; k: SortKey }) => (
    <TableHead
      className="cursor-pointer select-none whitespace-nowrap"
      onClick={() => handleSort(k)}
    >
      <span className="flex items-center">
        {label}<SortIcon k={k} />
      </span>
    </TableHead>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search header or reviewer..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v ?? "all"); setPage(1) }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Done">Done</SelectItem>
            <SelectItem value="In Process">In Process</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={v => { setTypeFilter(v ?? "all"); setPage(1) }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            {types.map(t => (
              <SelectItem key={t} value={t}>{t === "all" ? "All types" : t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="ml-auto text-sm text-muted-foreground">
          {filtered.length} of {data.length} records
        </span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead label="Header" k="header" />
              <SortableHead label="Type" k="type" />
              <SortableHead label="Status" k="status" />
              <SortableHead label="Target" k="target" />
              <SortableHead label="Limit" k="limit" />
              <SortableHead label="Reviewer" k="reviewer" />
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  No results found.
                </TableCell>
              </TableRow>
            ) : paginated.map(doc => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium max-w-55 truncate">{doc.header}</TableCell>
                <TableCell>
                  <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                    {doc.type}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={doc.status === "Done" ? "default" : "secondary"}>
                    {doc.status}
                  </Badge>
                </TableCell>
                <TableCell>{doc.target}</TableCell>
                <TableCell>{doc.limit}</TableCell>
                <TableCell className={doc.reviewer === "Assign reviewer" ? "text-muted-foreground italic" : ""}>
                  {doc.reviewer}
                </TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-2">
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="justify-start gap-2"
                          onClick={() => {
                            setSelectedDoc(doc)
                            setViewDialog(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="justify-start gap-2"
                          onClick={() => alert("Edit functionality not implemented in this demo")}
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="justify-start gap-2 text-destructive hover:text-destructive"
                          onClick={() => onDelete(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      </div>

      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
            <DialogDescription>View information about the selected document</DialogDescription>
          </DialogHeader>
          {selectedDoc && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Header</p>
                <p className="text-base">{selectedDoc.header}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <p className="text-base">{selectedDoc.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={selectedDoc.status === "Done" ? "default" : "secondary"}>
                  {selectedDoc.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Target</p>
                <p className="text-base">{selectedDoc.target}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Limit</p>
                <p className="text-base">{selectedDoc.limit}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reviewer</p>
                <p className="text-base">{selectedDoc.reviewer}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">File</p>
                {selectedDoc.base64 ? (
                  <img
                    src={selectedDoc.base64}
                    alt="Attached file"
                    className="object-cover rounded-md border max-h-96"
                  />
                ) : (
                  <p className="text-sm italic text-muted-foreground">No file attached</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}