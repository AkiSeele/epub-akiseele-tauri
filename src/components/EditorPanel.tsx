import React, { useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { useEpubStore } from '@/store/useEpubStore';
import { Type, Edit3 } from 'lucide-react';

/**
 * 编辑器面板组件
 */
export const EditorPanel: React.FC = () => {
  const { files, activeFileId, updateFileContent } = useEpubStore();

  // 根据 activeFileId 获取当前文件对象
  const activeFile = useMemo(() => 
    files.find(f => f.id === activeFileId),
    [files, activeFileId]
  );

  // 推断编辑器语言
  const language = useMemo(() => {
    if (!activeFile) return 'text';
    if (activeFile.type === 'xhtml') return 'html';
    if (activeFile.type === 'css') return 'css';
    return 'text';
  }, [activeFile]);

  // 处理内容改变
  const handleEditorChange = (value: string | undefined) => {
    if (activeFileId && value !== undefined) {
      updateFileContent(activeFileId, value);
    }
  };

  if (!activeFile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-accent/5">
        <Edit3 className="size-12 mb-4 opacity-20" />
        <p className="text-sm font-medium">请在左侧选择要编辑的文件</p>
        <p className="text-xs mt-1 opacity-60">双击章节或样式文件以开始</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden border-l">
      {/* 编辑器页眉 */}
      <div className="flex items-center px-4 py-2 border-b bg-muted/20">
        <Type className="size-4 mr-2" />
        <span className="text-xs font-mono">{activeFile.filename}</span>
        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 font-semibold uppercase">
          {activeFile.type}
        </span>
      </div>

      {/* Monaco Editor 容器 */}
      <div className="flex-1 overflow-hidden relative">
        <Editor
          height="100%"
          width="100%"
          language={language}
          value={activeFile.content}
          theme="vs-light"
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineHeight: 1.6,
            fontFamily: "'Cascadia Code', 'Fira Code', monospace",
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
          }}
          onChange={handleEditorChange}
        />
      </div>
    </div>
  );
};

export default EditorPanel;
