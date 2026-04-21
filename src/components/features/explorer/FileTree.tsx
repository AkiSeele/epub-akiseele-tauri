import React from "react"
import { useEpubStore } from "@/store/useEpubStore"
import {
  Folder,
  FolderOpen,
  FileText,
  Image as ImageIcon,
  ChevronRight,
  ChevronDown,
  Hash,
} from "lucide-react"
import { type EpubFile } from "@/types/epub"

interface FileTreeProps {
  files: EpubFile[]
  parentId: string | null
}

export const FileTree: React.FC<FileTreeProps> = ({ files, parentId }) => {
  const { setActiveFile, setSelection } = useEpubStore()
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleFileClick = (file: EpubFile) => {
    if (file.isFolder) {
      toggleExpand(file.id)
    } else {
      setActiveFile(file.id)
      setSelection("file", file)
    }
  }

  const currentFiles = files.filter((f) => f.parentId === parentId)

  return (
    <div className="flex flex-col">
      {currentFiles.map((file) => (
        <div key={file.id} className="flex flex-col">
          <div
            onClick={() => handleFileClick(file)}
            className="group flex cursor-pointer items-center rounded-sm px-2 py-1.5 transition-colors hover:bg-accent/50"
          >
            <div className="flex min-w-4 items-center text-muted-foreground">
              {file.isFolder &&
                (expanded[file.id] ? (
                  <ChevronDown className="size-3.5" />
                ) : (
                  <ChevronRight className="size-3.5" />
                ))}
            </div>

            <div className="mr-2 flex items-center">
              {file.isFolder ? (
                expanded[file.id] ? (
                  <FolderOpen className="size-4 fill-amber-500/10 text-amber-500" />
                ) : (
                  <Folder className="size-4 fill-amber-500/10 text-amber-500" />
                )
              ) : (
                getFileIcon(file.type)
              )}
            </div>

            <span className="truncate text-sm select-none">
              {file.filename}
            </span>
          </div>

          {file.isFolder && expanded[file.id] && (
            <div className="ml-3.5 border-l border-muted-foreground/10 pl-4">
              <FileTree files={files} parentId={file.id} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function getFileIcon(type?: string) {
  switch (type) {
    case "xhtml":
      return <FileText className="size-4 text-blue-500" />
    case "css":
      return <Hash className="size-4 text-orange-500" />
    case "image":
      return <ImageIcon className="size-4 text-emerald-500" />
    case "opf":
      return (
        <div className="flex size-4 items-center justify-center rounded-sm bg-purple-500 text-[8px] font-bold text-white">
          OPF
        </div>
      )
    case "ncx":
      return (
        <div className="flex size-4 items-center justify-center rounded-sm bg-indigo-500 text-[8px] font-bold text-white">
          NCX
        </div>
      )
    default:
      return <FileText className="size-4 text-muted-foreground" />
  }
}
