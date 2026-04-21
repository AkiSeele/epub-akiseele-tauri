/**
 * EPUB 核心数据模型与类型定义
 * 严格遵循 EPUB 3.0 规范，且符合 verbatimModuleSyntax 要求
 */

export interface EpubMetadata {
  title: string;
  creator: string;
  language: string;
  identifier: string;
  description?: string;
  publisher?: string;
}

export interface EpubManifestItem {
  id: string;
  href: string;
  mediaType: string;
  properties?: string;
}

export interface EpubSpineItem {
  idref: string;
  linear?: string;
}

export interface EpubFile {
  id: string;
  filename: string;
  type?: "xhtml" | "css" | "image" | "opf" | "ncx";
  content: string;
  isFolder: boolean;
  parentId: string | null;
  path: string;
  tocTitle?: string;
}

export type SelectionType = "book" | "file" | null;
export type SelectionData = any; // 之后可细化

export interface LintIssue {
  level: "error" | "warning";
  message: string;
  file?: string;
}
