import React, { useState } from "react"
import { useEpubStore } from "@/store/useEpubStore"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { User, Globe, Hash, Info, Download, Loader2 } from "lucide-react"
import { toast } from "sonner"

export const BookPropertiesPanel: React.FC = () => {
  const { metadata, updateMetadata, exportEpub, projectPath } = useEpubStore()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (!projectPath) {
      toast.error("操作取消", {
        description: "请先打开一个 EPUB 项目文件夹再进行导出",
      })
      return
    }
    setIsExporting(true)
    try {
      await exportEpub()
      toast.success("导出完成", { description: "您的 EPUB 书籍已成功生成！" })
    } catch (e: unknown) {
      const error = e as Error
      toast.error("打包失败", {
        description: error.message || "Rust 后端返回了错误",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center border-b bg-muted/30 px-4 py-2">
        <Info className="mr-2 size-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">
          书籍元数据
        </span>
      </div>
      <div className="space-y-6 overflow-y-auto p-4">
        <div className="space-y-2">
          <div className="mb-1 flex items-center text-muted-foreground">
            <Info className="mr-2 size-3.5" />
            <Label
              htmlFor="title"
              className="text-xs font-medium uppercase opacity-70"
            >
              书名 (Title)
            </Label>
          </div>
          <Input
            id="title"
            value={metadata.title}
            onChange={(e) => updateMetadata({ title: e.target.value })}
            className="h-8 text-sm focus-visible:ring-1"
            placeholder="输入书名"
          />
        </div>
        <div className="space-y-2">
          <div className="mb-1 flex items-center text-muted-foreground">
            <User className="mr-2 size-3.5" />
            <Label
              htmlFor="creator"
              className="text-xs font-medium uppercase opacity-70"
            >
              作者 (Creator)
            </Label>
          </div>
          <Input
            id="creator"
            value={metadata.creator}
            onChange={(e) => updateMetadata({ creator: e.target.value })}
            className="h-8 text-sm focus-visible:ring-1"
            placeholder="输入作者姓名"
          />
        </div>
        <div className="space-y-2">
          <div className="mb-1 flex items-center text-muted-foreground">
            <Globe className="mr-2 size-3.5" />
            <Label className="text-xs font-medium uppercase opacity-70">
              语言 (Language)
            </Label>
          </div>
          <Select
            value={metadata.language}
            onValueChange={(value) => updateMetadata({ language: value })}
          >
            <SelectTrigger className="h-8 text-sm focus:ring-1">
              <SelectValue placeholder="选择语言" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zh-CN">简体中文 (zh-CN)</SelectItem>
              <SelectItem value="en">English (en)</SelectItem>
              <SelectItem value="ja">日本語 (ja)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <div className="mb-1 flex items-center text-muted-foreground">
            <Hash className="mr-2 size-3.5" />
            <Label
              htmlFor="identifier"
              className="text-xs font-medium uppercase opacity-70"
            >
              标识符 (Identifier)
            </Label>
          </div>
          <Input
            id="identifier"
            value={metadata.identifier}
            onChange={(e) => updateMetadata({ identifier: e.target.value })}
            className="h-8 font-mono text-xs focus-visible:ring-1"
            placeholder="UUID / ISBN"
          />
        </div>
        <div className="border-t pt-4">
          <Button
            className="h-9 w-full gap-2 text-xs"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            {isExporting ? "正在打包..." : "导出 EPUB 书籍"}
          </Button>
          <p className="mt-2 text-center text-[10px] text-muted-foreground opacity-50">
            符合 IDPF EPUB 3.0 规范
          </p>
        </div>
      </div>
    </div>
  )
}
