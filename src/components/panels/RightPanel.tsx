import React from "react"
import { useEpubStore } from "@/store/useEpubStore"
import { BookPropertiesPanel } from "@/components/features/properties/BookPropertiesPanel"
import { FilePropertiesPanel } from "@/components/features/properties/FilePropertiesPanel"
import { ManifestManager } from "@/components/features/properties/ManifestManager"
import { ValidationPanel } from "@/components/features/properties/ValidationPanel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Settings2,
  Layers,
  Settings,
  BookOpen,
  AlertTriangle,
} from "lucide-react"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

export const RightPanel: React.FC = () => {
  const { selectionType, validationIssues } = useEpubStore()

  const errorCount = validationIssues.filter((i) => i.level === "error").length

  return (
    <div className="flex h-full flex-col border-l bg-background">
      <Tabs defaultValue="properties" className="flex flex-1 flex-col">
        <div className="border-b bg-muted/10 px-2 pt-2">
          <TabsList className="h-8 w-full bg-muted/20 p-1">
            <TabsTrigger
              value="properties"
              className="h-6 flex-1 gap-1.5 text-[10px]"
            >
              <Settings2 className="size-3" />
              属性
            </TabsTrigger>
            <TabsTrigger
              value="manifest"
              className="h-6 flex-1 gap-1.5 text-[10px]"
            >
              <Layers className="size-3" />
              清单
            </TabsTrigger>
            <TabsTrigger
              value="validation"
              className="relative h-6 flex-1 gap-1.5 text-[10px]"
            >
              <AlertTriangle className="size-3" />
              校验
              {errorCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 size-2 animate-pulse rounded-full bg-destructive" />
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="properties"
          className="m-0 flex flex-1 flex-col outline-none"
        >
          {selectionType === "book" && <BookPropertiesPanel />}
          {selectionType === "file" && <FilePropertiesPanel />}
          {!selectionType && (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground opacity-30">
              <Settings className="mb-2 size-10" />
              <p className="text-xs">选择文件或书籍以查看属性</p>
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="manifest"
          className="m-0 flex flex-1 flex-col outline-none"
        >
          <ManifestManager />
        </TabsContent>

        <TabsContent
          value="validation"
          className="m-0 flex flex-1 flex-col outline-none"
        >
          <ValidationPanel />
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between border-t bg-muted/30 px-3 py-1.5">
        <div className="flex items-center text-[9px] text-muted-foreground">
          <BookOpen className="mr-1 size-3" />
          <span>EPUB 3.0 Standard</span>
        </div>
        <div className="mr-2 flex items-center text-[9px] text-muted-foreground">
          v0.1.0
        </div>
        <ThemeToggle />
      </div>
    </div>
  )
}
