export type Document = {
  id: number
  header: string
  type: string
  status: "Done" | "In Process"
  target: string
  limit: string
  reviewer: string
}