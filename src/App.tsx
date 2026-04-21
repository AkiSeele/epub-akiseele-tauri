import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { FileTreePanel } from "@/components/panels/FileTreePanel"
import { EditorPanel } from "@/components/panels/EditorPanel"
import { RightPanel } from "@/components/panels/RightPanel"
import { Toaster } from "@/components/ui/sonner"

export function App() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground">
      <Toaster position="top-right" richColors />
      <ResizablePanelGroup direction="horizontal">
        {/* Left: File Tree */}
        <ResizablePanel defaultSize={20} minSize={15}>
          <FileTreePanel />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Center: Editor */}
        <ResizablePanel defaultSize={60} minSize={30}>
          <EditorPanel />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right: Properties */}
        <ResizablePanel defaultSize={20} minSize={15}>
          <RightPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default App
