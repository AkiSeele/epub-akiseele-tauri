import React, { useMemo } from "react"
import { convertFileSrc } from "@tauri-apps/api/core"

interface LivePreviewProps {
  content: string
  projectPath: string | null
  filePath: string
}

/**
 * 实时预览组件
 * 使用 iframe srcdoc 实现无缝渲染，并通过 <base> 标签打通本地资源路径 (asset 协议)
 */
export const LivePreview: React.FC<LivePreviewProps> = ({
  content,
  projectPath,
  filePath,
}) => {
  const baseUrl = useMemo(() => {
    if (!projectPath) return ""
    // 将整个物理路径转换为 asset 协议的基础路径，供 iframe 内部相对路径查找（如图片、CSS）
    return convertFileSrc(filePath)
  }, [projectPath, filePath])

  // 注入 base 标签以支持相对路径资源加载
  // 注入简单样式以优化预览初感
  const srcDoc = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <base href="${baseUrl}">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              padding: 2rem;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              color: var(--foreground, #1a1a1a);
              background-color: var(--background, #ffffff);
            }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `
  }, [content, baseUrl])

  if (!projectPath) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/5 p-4 text-center">
        <p className="text-xs text-muted-foreground">等待项目加载以预览...</p>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-white">
      <iframe
        title="EPUB Preview"
        srcDoc={srcDoc}
        className="h-full w-full border-none"
        sandbox="allow-same-origin"
      />
    </div>
  )
}
