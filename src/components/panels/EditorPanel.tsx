import React, { useMemo, useState, useEffect } from "react"
import Editor, { type OnMount } from "@monaco-editor/react"
import { useEpubStore } from "@/store/useEpubStore"
import {
  Type,
  Edit3,
  Eye,
  EyeOff,
  LayoutPanelLeft,
  ImageIcon,
} from "lucide-react"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import { LivePreview } from "@/components/features/editor/LivePreview"
import { ImagePreview } from "@/components/features/editor/ImagePreview"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"

/**
 * 编辑器面板组件 (支持文本编辑与图片预览多模态)
 */
export const EditorPanel: React.FC = () => {
  const {
    files,
    activeFileId,
    updateFileContent,
    updateFileFields,
    saveActiveFile,
    projectPath,
  } = useEpubStore()
  const { theme } = useTheme()
  const [showPreview, setShowPreview] = useState(true)
  const [debouncedContent, setDebouncedContent] = useState("")

  // 映射 Monaco 主题
  const monacoTheme = theme === "dark" ? "vs-dark" : "vs-light"

  // 根据 activeFileId 获取当前文件对象
  const activeFile = useMemo(
    () => files.find((f) => f.id === activeFileId),
    [files, activeFileId]
  )

  // 防抖同步
  useEffect(() => {
    if (!activeFile || activeFile.type === "image") return
    const timer = setTimeout(() => {
      setDebouncedContent(activeFile.content)
    }, 300)
    return () => clearTimeout(timer)
  }, [activeFile?.content, activeFile?.type])

  // 推断编辑器语言
  const language = useMemo(() => {
    if (!activeFile) return "text"
    if (activeFile.type === "xhtml") return "html"
    if (activeFile.type === "css") return "css"
    return "text"
  }, [activeFile])

  const handleSave = async () => {
    if (activeFile?.type === "image") return
    try {
      await saveActiveFile()
      toast.success("文件保存成功", {
        description: `已保存至: ${activeFile?.filename}`,
      })
    } catch (e) {
      toast.error("保存失败", { description: "请检查文件权限或路径" })
    }
  }

  const handleEditorChange = (value: string | undefined) => {
    if (activeFileId && value !== undefined) {
      updateFileContent(activeFileId, value)
      if (activeFile?.type === "xhtml") {
        try {
          const parser = new DOMParser()
          const doc = parser.parseFromString(value, "text/html")
          const extractedTitle = doc.querySelector("title")?.textContent
          if (extractedTitle)
            updateFileFields(activeFileId, { tocTitle: extractedTitle })
        } catch (e) {
          console.warn("Failed to parse title from HTML", e)
        }
      }
    }
  }

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave()
    })
  }

  if (!activeFile) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-accent/5 text-muted-foreground">
        <Edit3 className="mb-4 size-12 opacity-20" />
        <p className="text-sm font-medium">请在左侧选择要编辑的文件</p>
        <p className="mt-1 text-xs opacity-60">双击章节或样式文件以开始</p>
      </div>
    )
  }

  // 1. 图片预览模式
  if (activeFile.type === "image") {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden border-l bg-background">
        <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-1.5">
          <div className="flex items-center">
            <ImageIcon className="mr-2 size-4 text-emerald-500" />
            <span className="font-mono text-xs">{activeFile.filename}</span>
            <span className="ml-2 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-emerald-600">
              Image Asset
            </span>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <ImagePreview
            filePath={activeFile.path}
            filename={activeFile.filename}
          />
        </div>
      </div>
    )
  }

  // 2. 文本编辑模式
  return (
    <div className="flex h-full w-full flex-col overflow-hidden border-l bg-background">
      <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-1.5">
        <div className="flex items-center">
          <Type className="mr-2 size-4" />
          <span className="font-mono text-xs">{activeFile.filename}</span>
          <span className="ml-2 rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-blue-600">
            {activeFile.type}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {activeFile.type === "xhtml" && (
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 gap-1.5 px-2 text-[10px] ${showPreview ? "bg-accent" : ""}`}
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? (
                <Eye className="size-3.5" />
              ) : (
                <EyeOff className="size-3.5" />
              )}
              预览模式
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSave}>
            <LayoutPanelLeft className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            defaultSize={showPreview && activeFile.type === "xhtml" ? 50 : 100}
            minSize={20}
          >
            <Editor
              height="100%"
              width="100%"
              language={language}
              value={activeFile.content}
              theme={monacoTheme}
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                lineHeight: 1.6,
                fontFamily: "'Cascadia Code', 'Fira Code', monospace",
                wordWrap: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
              }}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
            />
          </ResizablePanel>
          {showPreview && activeFile.type === "xhtml" && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50} minSize={20}>
                <LivePreview
                  content={debouncedContent}
                  projectPath={projectPath}
                  filePath={activeFile.path}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  )
}

export default EditorPanel
