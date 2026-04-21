import { type StateCreator } from "zustand"
import { type EpubStore } from "../useEpubStore"
import {
  type EpubMetadata,
  type EpubManifestItem,
  type EpubSpineItem,
} from "@/types/epub"

export interface MetadataSlice {
  metadata: EpubMetadata
  manifest: EpubManifestItem[]
  spine: EpubSpineItem[]
  updateMetadata: (metadata: Partial<EpubMetadata>) => void
  addManifestItem: (item: EpubManifestItem) => void
  removeManifestItem: (id: string) => void
  updateSpine: (spine: EpubSpineItem[]) => void
  syncLogicalStructure: () => Promise<void>
}

export const createMetadataSlice: StateCreator<
  EpubStore,
  [],
  [],
  MetadataSlice
> = (set, get) => ({
  metadata: {
    title: "未命名书籍",
    creator: "未知作者",
    language: "zh-CN",
    identifier: "",
  },
  manifest: [],
  spine: [],
  updateMetadata: (newMetadata) =>
    set((state) => ({
      metadata: { ...state.metadata, ...newMetadata },
    })),
  addManifestItem: (item) =>
    set((state) => ({
      manifest: [...state.manifest, item],
    })),
  removeManifestItem: (id) =>
    set((state) => ({
      manifest: state.manifest.filter((i) => i.id !== id),
    })),
  updateSpine: (newSpine) => set({ spine: newSpine }),
  syncLogicalStructure: async () => {
    const { metadata, manifest, spine, projectPath, files } = get()
    if (!projectPath) return

    try {
      const { generateOpf, generateNav } = await import("@/lib/opfGenerator")
      const { writeTextFile } = await import("@tauri-apps/plugin-fs")
      const { join, dirname } = await import("@tauri-apps/api/path")

      const opfFile = files.find((f) => f.type === "opf")
      const opfPath = opfFile
        ? opfFile.path
        : await join(projectPath, "OEBPS", "content.opf")
      const oebpsDir = await dirname(opfPath)

      const opfContent = generateOpf(metadata, manifest, spine)
      await writeTextFile(opfPath, opfContent)

      const tocItems = spine.map((s) => {
        const file = files.find((f) => {
          const item = manifest.find((m) => m.id === s.idref)
          return item && f.filename === item.href
        })
        return {
          title: file?.tocTitle || file?.filename || "Untitled",
          id: file?.filename || "",
          level: 1,
          children: [],
        }
      })

      const navContent = generateNav(metadata.title, tocItems)
      const navPath = await join(oebpsDir, "nav.xhtml")
      await writeTextFile(navPath, navContent)
      console.log("Logical structure synced.")
    } catch (e) {
      console.error("Sync failed:", e)
    }
  },
})
