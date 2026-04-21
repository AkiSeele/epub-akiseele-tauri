import React, { useEffect } from "react"
import { useEpubStore } from "@/store/useEpubStore"
import { AlertCircle, AlertTriangle, CheckCircle2, RefreshCw, FileWarning } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export const ValidationPanel: React.FC = () => {
  const { validationIssues, runValidation, projectPath, setActiveFile } = useEpubStore()

  useEffect(() => {
    if (projectPath) {
      runValidation()
    }
  }, [projectPath])

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
        <div className="flex items-center">
          <FileWarning className="mr-2 size-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            质量校验 (Lint)
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={() => runValidation()}
        >
          <RefreshCw className="size-3" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {validationIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <CheckCircle2 className="mb-2 size-8 text-emerald-500 opacity-20" />
            <p className="text-xs font-medium text-emerald-600/60">
              未发现结构性冲突
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground opacity-50">
              项目符合基础 EPUB 3.0 物理规范
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-muted/50">
            {validationIssues.map((issue, index) => (
              <div
                key={index}
                className="flex cursor-default flex-col gap-1 p-3 transition-colors hover:bg-accent/5"
              >
                <div className="flex items-start gap-2">
                  {issue.level === "error" ? (
                    <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                  ) : (
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                  )}
                  <span className="text-[11px] leading-relaxed">
                    {issue.message}
                  </span>
                </div>
                {issue.file && (
                  <div className="mt-1 flex items-center gap-1 pl-5">
                    <span className="text-[9px] font-mono text-muted-foreground opacity-70">
                      File: {issue.file}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="border-t bg-muted/5 p-3">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>
            {validationIssues.filter((i) => i.level === "error").length} 错误
          </span>
          <span>
            {validationIssues.filter((i) => i.level === "warning").length} 警告
          </span>
        </div>
      </div>
    </div>
  )
}
