import React, { useState, useEffect } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { ImageIcon, Maximize2, FileImage } from 'lucide-react';

interface ImagePreviewProps {
  filePath: string;
  filename: string;
}

/**
 * 图片资源预览组件
 */
export const ImagePreview: React.FC<ImagePreviewProps> = ({ filePath, filename }) => {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const assetUrl = convertFileSrc(filePath);

  // 当图片加载时获取其原始尺寸
  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
  };

  return (
    <div className="flex flex-col h-full bg-muted/10 overflow-hidden">
      {/* 底部信息栏 - 显示元数据 */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background shadow-sm">
        <div className="flex items-center gap-2">
          <FileImage className="size-4 text-emerald-500" />
          <span className="text-xs font-mono truncate max-w-[200px]">{filename}</span>
        </div>
        
        {dimensions && (
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-mono">
            <div className="flex items-center gap-1">
              <span className="opacity-50">SIZE:</span>
              <span>{dimensions.width} × {dimensions.height} px</span>
            </div>
          </div>
        )}
      </div>

      {/* 图片展示区 - 居中且带棋盘格背景 */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uAn4QCif1RBlAEnOfuQ8PBjFX90Dx6S4pYS9F68AA37+S4Ay8jEE7vHcwQAAAAASUVORK5CYII=')] bg-repeat overflow-auto">
        <div className="relative group shadow-2xl transition-all duration-300">
          <img
            src={assetUrl}
            alt={filename}
            onLoad={handleLoad}
            className="max-w-full max-h-[80vh] object-contain bg-white rounded-sm ring-1 ring-black/5"
          />
          
          {/* 交互遮罩 */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
          
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="p-1 px-2 bg-black/50 text-white text-[9px] rounded-full flex items-center gap-1 backdrop-blur-sm">
              <Maximize2 className="size-2.5" />
              1:1 VIEW
            </div>
          </div>
        </div>
      </div>

      {/* 备注提示 */}
      <div className="p-3 text-center border-t bg-background/50">
        <p className="text-[10px] text-muted-foreground opacity-60 italic">
          预览自物理路径: {filePath}
        </p>
      </div>
    </div>
  );
};
