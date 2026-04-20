import { create } from 'zustand';

/**
 * 书籍元数据接口
 */
export interface BookMetadata {
  title: string;
  author: string;
  language: string;
  description: string;
  publisher?: string;
  date?: string;
}

/**
 * EPUB 文件接口
 */
export interface EpubFile {
  id: string;
  filename: string;
  type?: 'xhtml' | 'css' | 'image' | 'toc' | 'ncx' | 'opf';
  content: string;
  isFolder: boolean;
  parentId: string | null;
}

/**
 * Metadata Slice
 */
interface MetadataSlice {
  metadata: BookMetadata;
  updateMetadata: (metadata: Partial<BookMetadata>) => void;
}

const createMetadataSlice = (set: any): MetadataSlice => ({
  metadata: {
    title: '示例书籍',
    author: 'Antigravity',
    language: 'zh-CN',
    description: '这是一本用于测试的示例 EPUB 书籍。',
  },
  updateMetadata: (newMetadata) =>
    set((state: any) => ({
      metadata: { ...state.metadata, ...newMetadata },
    })),
});

/**
 * File Tree Slice
 */
interface FileTreeSlice {
  files: EpubFile[];
  updateFileContent: (id: string, newContent: string) => void;
  addFile: (file: EpubFile) => void;
}

const createFileTreeSlice = (set: any): FileTreeSlice => ({
  files: [
    {
      id: '1',
      filename: 'chapter1.xhtml',
      type: 'xhtml',
      content: '<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html><html><head><title>第一章</title></head><body><h1>第一章</h1><p>这是第一章的内容。</p></body></html>',
      isFolder: false,
      parentId: 'text',
    },
    {
      id: '2',
      filename: 'chapter2.xhtml',
      type: 'xhtml',
      content: '<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html><html><head><title>第二章</title></head><body><h1>第二章</h1><p>这是第二章的内容，包含一些更长的测试文本。</p></body></html>',
      isFolder: false,
      parentId: 'text',
    },
    {
      id: '3',
      filename: 'style.css',
      type: 'css',
      content: 'body {\n  font-family: sans-serif;\n  line-height: 1.5;\n}\nh1 {\n  color: #333;\n}',
      isFolder: false,
      parentId: 'styles',
    },
  ],
  updateFileContent: (id, newContent) =>
    set((state: any) => ({
      files: state.files.map((file: EpubFile) =>
        file.id === id ? { ...file, content: newContent } : file
      ),
    })),
  addFile: (file) =>
    set((state: any) => ({
      files: [...state.files, file],
    })),
});

/**
 * Editor Slice
 */
interface EditorSlice {
  activeFileId: string | null;
  setActiveFile: (id: string | null) => void;
}

const createEditorSlice = (set: any): EditorSlice => ({
  activeFileId: '1', // 默认选中第一个章节
  setActiveFile: (id) => set({ activeFileId: id }),
});

/**
 * Combine Slices into Root Store
 */
export type EpubStore = MetadataSlice & FileTreeSlice & EditorSlice;

export const useEpubStore = create<EpubStore>()((...a) => ({
  ...createMetadataSlice(...a),
  ...createFileTreeSlice(...a),
  ...createEditorSlice(...a),
}));
