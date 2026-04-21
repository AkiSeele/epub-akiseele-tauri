import { type StateCreator } from "zustand"
import { type EpubStore } from "../useEpubStore"
import { invoke } from "@tauri-apps/api/core"
import { type SelectionType, type SelectionData, type LintIssue } from "@/types/epub"

export interface EditorSlice {
  activeFileId: string | null
  selectionType: SelectionType
  selectionData: SelectionData
  validationIssues: LintIssue[]
  setActiveFile: (id: string | null) => void
  setSelection: (type: SelectionType, data: SelectionData) => void
  runValidation: () => Promise<void>
  saveActiveFile: () => Promise<void>
  exportEpub: () => Promise<void>
}

export const createEditorSlice: StateCreator<EpubStore, [], [], EditorSlice> = (
  set,
  get
) => ({
  activeFileId: null,
  selectionType: "book",
  selectionData: null,
  validationIssues: [],
  setActiveFile: (id) => set({ activeFileId: id }),
  setSelection: (type, data) =>
    set({ selectionType: type, selectionData: data }),
  
  runValidation: async () => {
    const { projectPath } = get()
    if (!projectPath) return
    try {
      const issues = await invoke<LintIssue[]>("lint_project", { sourcePath: projectPath })
      set({ validationIssues: issues })
    } catch (e) {
      console.error("Validation failed:", e)
    }
  },

  saveActiveFile: async () => {
    const { activeFileId, files, syncLogicalStructure, runValidation } = get()
    if (!activeFileId) return
    const file = files.find((f) => f.id === activeFileId)
    if (!file || file.isFolder) return

    try {
      if (window.__TAURI_INTERNALS__) {
        const { writeTextFile } = await import("@tauri-apps/plugin-fs")
        await writeTextFile(file.path, file.content)
        await syncLogicalStructure()
        // 保存后自动触发校验
        await runValidation()
      }
    } catch (error) {
      console.error("Save failed:", error)
      throw error
    }
  },
  
  exportEpub: async () => {
    const { projectPath, saveActiveFile } = get()
    if (!projectPath) throw new Error("请先打开项目文件夹")
    await saveActiveFile()

    try {
      const { save } = await import("@tauri-apps/plugin-dialog")
      const targetPath = await save({
        title: "导出 EPUB 书籍",
        filters: [{ name: "EPUB Publication", extensions: ["epub"] }],
        defaultPath: "book.epub",
      })
      if (!targetPath) return

      await invoke("package_epub", {
        sourcePath: projectPath,
        targetPath: targetPath,
      })
    } catch (error) {
      console.error("Export failed:", error)
      throw error
    }
  },
})
