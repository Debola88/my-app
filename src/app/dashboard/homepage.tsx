import { AddForm } from "@/views/form";
import { DocumentTable } from "@/views/form/_component/document-table";
import type { Document } from "@/types/document";
import { useEffect, useState } from "react";
import { InitialDocuments } from "@/data/document";

export default function Homepage() {
  const [docs, setDocs] = useState<Document[]>(() => {
    try {
      const storedDocs = localStorage.getItem("documents");
      return storedDocs ? JSON.parse(storedDocs) : InitialDocuments;
    } catch {
      return InitialDocuments;
    }
  });

  useEffect(() => {
    localStorage.setItem("documents", JSON.stringify(docs));
  }, [docs]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium">Documents</h1>
          <p className="text-sm text-muted-foreground">
            {docs.length} total documents
          </p>
        </div>
        <AddForm onAdd={(doc) => setDocs((prev) => [doc, ...prev])} />
      </div>
      <DocumentTable
        data={docs}
        onDelete={(id) => setDocs((prev) => prev.filter((d) => d.id !== id))}
      />
    </div>
  );
}
