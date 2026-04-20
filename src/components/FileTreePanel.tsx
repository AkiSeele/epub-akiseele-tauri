import React from 'react';
import { useEpubStore } from '@/store/useEpubStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  FileCode2, 
  Image as ImageIcon, 
  Book, 
  FileJson,
  FolderOpen
} from 'lucide-react';

/**
 * 根据文件类型分配图标
 */
const getFileIcon = (type?: string) => {
  switch (type) {
    case 'xhtml':
      return <FileText className="size-4 mr-2 text-blue-500" />;
    case 'css':
      return <FileCode2 className="size-4 mr-2 text-purple-500" />;
    case 'image':
      return <ImageIcon className="size-4 mr-2 text-green-500" />;
    case 'toc':
    case 'ncx':
      return <Book className="size-4 mr-2 text-orange-500" />;
    case 'opf':
      return <FileJson className="size-4 mr-2 text-yellow-500" />;
    default:
      return <FileText className="size-4 mr-2 text-muted-foreground" />;
  }
};

export const FileTreePanel: React.FC = () => {
  const { files, activeFileId, setActiveFile } = useEpubStore();

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center px-4 py-2 border-b bg-muted/30">
        <FolderOpen className="size-4 mr-2" />
        <span className="text-xs font-semibold uppercase tracking-wider">文件管理器</span>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {files.map((file) => (
            <div
              key={file.id}
              onClick={() => setActiveFile(file.id)}
              className={cn(
                "flex items-center px-3 py-2 rounded-md cursor-pointer transition-colors text-sm",
                "hover:bg-accent hover:text-accent-foreground",
                activeFileId === file.id && "bg-accent text-accent-foreground font-medium"
              )}
            >
              {getFileIcon(file.type)}
              <span className="truncate">{file.filename}</span>
            </div>
          ))}
          
          {files.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-xs italic">
              暂无文件
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FileTreePanel;
