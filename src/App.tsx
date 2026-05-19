import { useState, useEffect } from "react"
import { registerSW } from "virtual:pwa-register"
import Homepage from "./app/dashboard/homepage"
import { AppSidebar } from "./components/app-sidebar"
import { SidebarProvider } from "./components/ui/sidebar"
import { Button } from "./components/ui/button"

export default function App() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [updateSW, setUpdateSW] = useState<(() => Promise<void>) | null>(null)

  useEffect(() => {
    const update = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true)
      },
      onOfflineReady() {
        console.log("App is ready to work offline")
      },
    })
    setUpdateSW(() => update)
  }, [])

  return (
    <SidebarProvider>
      {needRefresh && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-md border bg-background px-4 py-3 text-sm shadow-md">
          <span>A new version is available.</span>
          <Button size="sm" onClick={() => updateSW?.()}>
            Update now
          </Button>
        </div>
      )}
      <AppSidebar />
      <Homepage />
    </SidebarProvider>
  )
}