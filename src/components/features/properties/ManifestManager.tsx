import React from "react"
import { useEpubStore } from "@/store/useEpubStore"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ListOrdered, Trash2, FileJson, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { type EpubManifestItem } from "@/types/epub"

export const ManifestManager: React.FC = () => {
  const { manifest, spine, files, addManifestItem, removeManifestItem, syncLogicalStructure } = useEpubStore()

  const autoScan = () => {
    files.forEach(file => {
      if (file.isFolder) return
      const alreadyInManifest = manifest.some(m => m.href.includes(file.filename))
      if (!alreadyInManifest && file.type) {
        addManifestItem({
          id: `id_${Math.random().toString(36).substring(7)}`,
          href: file.filename,
          mediaType: getMediaType(file.type),
        })
      }
    })
    toast.success("扫描完成", { description: "已同步物理文件到清单" })
  }

  const getMediaType = (type: string) => {
    switch (type) {
      case "xhtml": return "application/xhtml+xml"
      case "css": return "text/css"
      case "image": return "image/jpeg"
      case "opf": return "application/oebps-package+xml"
      default: return "application/octet-stream"
    }
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
        <div className="flex items-center">
          <FileJson className="mr-2 size-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">资源清单 (Manifest)</span>
        </div>
        <button className="size-6 rounded hover:bg-muted" onClick={autoScan}>
          <RefreshCw className="mx-auto size-3" />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-2">
        <Table>
          <TableHeader>
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="h-8 text-[10px] uppercase">ID</TableHead>
              <TableHead className="h-8 text-[10px] uppercase">路径 (Href)</TableHead>
              <TableHead className="h-8 text-right text-[10px] uppercase">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {manifest.map((item: EpubManifestItem) => (
              <TableRow key={item.id} className="group">
                <TableCell className="py-1.5 font-mono text-[10px]">{item.id}</TableCell>
                <TableCell className="max-w-[100px] truncate py-1.5 text-[10px]">{item.href}</TableCell>
                <TableCell className="py-1.5 text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="size-6 text-destructive opacity-0 transition-opacity group-hover:opacity-100" 
                    onClick={() => removeManifestItem(item.id)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="border-t bg-muted/10">
        <div className="flex items-center border-b px-4 py-2">
          <ListOrdered className="mr-2 size-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">阅读顺序 (Spine)</span>
        </div>
        <div className="space-y-1 p-3">
          {spine.map((item, index) => (
            <div key={item.idref} className="flex items-center justify-between rounded border bg-background p-1.5 text-[10px]">
              <span className="mr-2 opacity-50">{index + 1}.</span>
              <span className="flex-1 font-mono">{item.idref}</span>
              <Badge variant="outline" className="h-4 text-[9px]">线性</Badge>
            </div>
          ))}
          {spine.length === 0 && (
            <p className="py-4 text-center text-[10px] font-medium text-muted-foreground opacity-50 italic">尚未定义阅读顺序</p>
          )}
        </div>
      </div>
      <div className="mt-auto border-t p-4">
        <Button className="h-8 w-full gap-2 text-xs" variant="outline" onClick={() => syncLogicalStructure()}>
          <RefreshCw className="size-3" />
          同步逻辑结构到磁盘
        </Button>
      </div>
    </div>
  )
}
