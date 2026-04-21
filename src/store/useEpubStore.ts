import { create } from "zustand"
import { createMetadataSlice, type MetadataSlice } from "./slices/metadataSlice"
import { createFileTreeSlice, type FileTreeSlice } from "./slices/fileTreeSlice"
import { createEditorSlice, type EditorSlice } from "./slices/editorSlice"

/**
 * 根 Store 类型定义，组合所有 Slice
 */
export type EpubStore = MetadataSlice & FileTreeSlice & EditorSlice

/**
 * EPUB 编辑器全局状态管理 (Slice Pattern)
 * 遵循 epubrules.md 规范进行模块化拆分
 */
export const useEpubStore = create<EpubStore>()((...a) => ({
  ...createMetadataSlice(...a),
  ...createFileTreeSlice(...a),
  ...createEditorSlice(...a),
}))
