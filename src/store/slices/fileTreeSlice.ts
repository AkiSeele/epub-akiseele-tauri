import { type StateCreator } from "zustand"
import { type EpubStore } from "../useEpubStore"
import { type EpubFile } from "@/types/epub"

export interface FileTreeSlice {
  files: EpubFile[]
  projectPath: string | null
  updateFileContent: (id: string, newContent: string) => void
  addFile: (file: EpubFile) => void
  updateFileFields: (id: string, fields: Partial<EpubFile>) => void
  renameFile: (id: string, newName: string) => Promise<void>
  openProjectFolder: () => Promise<void>
}

export const createFileTreeSlice: StateCreator<
  EpubStore,
  [],
  [],
  FileTreeSlice
> = (set, get) => ({
  files: [],
  projectPath: null,
  updateFileContent: (id, newContent) =>
    set((state) => ({
      files: state.files.map((file) =>
        file.id === id ? { ...file, content: newContent } : file
      ),
    })),
  addFile: (file) =>
    set((state) => ({
      files: [...state.files, file],
    })),
  updateFileFields: (id, fields) =>
    set((state) => ({
      files: state.files.map((file) =>
        file.id === id ? { ...file, ...fields } : file
      ),
    })),
  renameFile: async (id, newName) => {
    const file = get().files.find((f) => f.id === id)
    if (!file) return

    try {
      if (window.__TAURI_INTERNALS__) {
        const { rename } = await import("@tauri-apps/plugin-fs")
        const { join, dirname } = await import("@tauri-apps/api/path")
        const oldPath = file.path
        const dir = await dirname(oldPath)
        const newPath = await join(dir, newName)
        await rename(oldPath, newPath)
        set((state) => ({
          files: state.files.map((f) =>
            f.id === id ? { ...f, filename: newName, path: newPath } : f
          ),
        }))
      }
    } catch (error) {
      console.error("Rename failed:", error)
      throw error
    }
  },
  openProjectFolder: async () => {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog")
      const { readDir, readTextFile } = await import("@tauri-apps/plugin-fs")
      const { join } = await import("@tauri-apps/api/path")

      const selected = await open({
        directory: true,
        multiple: false,
        title: "选择 EPUB 项目根目录",
      })
      if (!selected || typeof selected !== "string") return
      set({ projectPath: selected, files: [] })

      const allFiles: EpubFile[] = []
      const walk = async (dirPath: string, parentId: string | null = null) => {
        const entries = await readDir(dirPath)
        for (const entry of entries) {
          const id = Math.random().toString(36).substring(7)
          const fullPath = await join(dirPath, entry.name)
          const isFolder = entry.isDirectory
          let content = ""
          let type: EpubFile["type"] = undefined

          if (!isFolder) {
            const ext = entry.name.split(".").pop()?.toLowerCase()
            if (ext === "xhtml" || ext === "html") type = "xhtml"
            else if (ext === "css") type = "css"
            else if (ext === "opf") type = "opf"
            else if (ext === "ncx") type = "ncx"
            else if (ext === "jpg" || ext === "png" || ext === "jpeg")
              type = "image"

            if (["xhtml", "css", "opf", "ncx"].includes(type || "")) {
              try {
                content = await readTextFile(fullPath)
              } catch (e) {
                console.warn(`Failed to read content of ${fullPath}`, e)
              }
            }
          }

          allFiles.push({
            id,
            filename: entry.name,
            type,
            content,
            isFolder,
            parentId,
            path: fullPath,
          })
          if (isFolder) await walk(fullPath, id)
        }
      }

      await walk(selected)
      set({ files: allFiles })
    } catch (error) {
      console.error("Failed to open project folder:", error)
    }
  },
})
