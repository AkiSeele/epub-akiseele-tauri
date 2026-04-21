import React, { useState, useEffect } from "react"
import { useEpubStore } from "@/store/useEpubStore"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FileText, Save, Info } from "lucide-react"
import { toast } from "sonner"

export const FilePropertiesPanel: React.FC = () => {
  const { selectionData, renameFile } = useEpubStore()
  const file = selectionData
  const [editedName, setEditedName] = useState(file?.filename || "")

  useEffect(() => {
    if (file) setEditedName(file.filename)
  }, [file])

  const handleRename = async () => {
    if (!file || !editedName || editedName === file.filename) return
    try {
      await renameFile(file.id, editedName)
      toast.success("重命名成功", { description: `已更名为: ${editedName}` })
    } catch (e: unknown) {
      toast.error("重命名失败", {
        description: "请检查文件名是否合法或文件是否被占用",
      })
    }
  }

  if (!file) return null

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center border-b bg-muted/30 px-4 py-2">
        <FileText className="mr-2 size-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">
          文件属性
        </span>
      </div>
      <div className="space-y-6 overflow-y-auto p-4">
        <div className="space-y-2">
          <div className="mb-1 flex items-center text-muted-foreground">
            <Info className="mr-2 size-3.5" />
            <Label
              htmlFor="filename"
              className="text-xs font-medium uppercase opacity-70"
            >
              文件名
            </Label>
          </div>
          <div className="flex gap-2">
            <Input
              id="filename"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="h-8 text-sm focus-visible:ring-1"
            />
            <Button
              size="icon"
              className="size-8 shrink-0"
              onClick={handleRename}
              disabled={editedName === file.filename}
            >
              <Save className="size-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 border-b border-dashed py-1">
            <span className="font-medium text-[10px] uppercase text-muted-foreground">
              类型
            </span>
            <span className="col-span-2 font-mono text-[10px]">
              {file.type || "未知"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 border-b border-dashed py-1">
            <span className="font-medium text-[10px] uppercase text-muted-foreground">
              物理路径
            </span>
            <span className="col-span-2 break-all font-mono text-[10px] opacity-70">
              {file.path}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
