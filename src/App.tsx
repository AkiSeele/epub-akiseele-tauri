import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { FileTreePanel } from "@/components/FileTreePanel"
import { EditorPanel } from "@/components/EditorPanel"

export function App() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground">
      <ResizablePanelGroup direction="horizontal">
        {/* Left: File Tree */}
        <ResizablePanel defaultSize={20} minSize={15}>
          <FileTreePanel />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Middle: Editor */}
        <ResizablePanel defaultSize={60} minSize={30}>
          <EditorPanel />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right: Properties */}
        <ResizablePanel defaultSize={20} minSize={15}>
          <div className="flex h-full items-center justify-center border-l p-6">
            <span className="font-semibold text-muted-foreground italic">
              属性
            </span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default App
