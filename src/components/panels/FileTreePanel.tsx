import React, { useState } from "react"
import { useEpubStore } from "@/store/useEpubStore"
import { FolderOpen, Search, FileUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileTree } from "@/components/features/explorer/FileTree"
import { toast } from "sonner"
import { invoke } from "@tauri-apps/api/core"

export const FileTreePanel: React.FC = () => {
  const { files, projectPath, openProjectFolder } = useEpubStore()
  const [isImporting, setIsImporting] = useState(false)

  // 处理 EPUB 导入
  const handleImport = async () => {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog")

      // 1. 选择要导入的 EPUB 文件
      const source = await open({
        multiple: false,
        filters: [{ name: "EPUB Book", extensions: ["epub"] }],
        title: "选择要导入的 EPUB 文件",
      })
      if (!source || typeof source !== "string") return

      // 2. 选择解压到的目标文件夹
      const target = await open({
        directory: true,
        multiple: false,
        title: "选择存放解压内容的文件夹",
      })
      if (!target || typeof target !== "string") return

      setIsImporting(true)
      toast.loading("正在解压并导入数据...", { id: "import-loading" })

      // 3. 调用 Rust 后端解压
      await invoke("import_epub", { sourcePath: source, targetPath: target })

      toast.success("导入成功", {
        id: "import-loading",
        description: "书籍已成功解压至目标目录",
      })

      // 4. 重复利用原有的打开逻辑加载该目录
      await openProjectFolder()
    } catch (e: unknown) {
      const error = e as Error
      toast.error("导入失败", {
        id: "import-loading",
        description: error.message || "解压过程出错",
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="flex h-full flex-col border-r bg-background">
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
        <div className="flex items-center">
          <FolderOpen className="mr-2 size-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            项目
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={handleImport}
            disabled={isImporting}
          >
            {isImporting ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <FileUp className="size-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={openProjectFolder}
          >
            <FolderOpen className="size-3" />
          </Button>
        </div>
      </div>
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 size-3 text-muted-foreground" />
          <Input
            placeholder="搜索文件..."
            className="h-8 border-none bg-muted/20 pl-7 text-xs focus-visible:ring-1"
          />
        </div>
      </div>
      <ScrollArea className="flex-1 px-1">
        {!projectPath ? (
          <div className="flex h-40 flex-col items-center justify-center p-4 text-center">
            <Button
              variant="outline"
              size="sm"
              className="mb-2 text-xs"
              onClick={openProjectFolder}
            >
              打开项目文件夹
            </Button>
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              支持打开文件夹或导入 .epub
            </p>
          </div>
        ) : (
          <FileTree files={files} parentId={null} />
        )}
      </ScrollArea>
    </div>
  )
}
