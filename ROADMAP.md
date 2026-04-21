# EPUB Akiseele Tauri - 项目路线图 (Roadmap)

这是一个使用 Tauri v2 + React 19 构建的现代化 EPUB 电子书编辑器。

## 🏗️ 项目架构说明 (Modern Workbench Architecture)

为了确保项目的可维护性，我们采用了功能模块化的目录结构：

- **`src/app/`**: 包含 `App.tsx`，作为整个工作台的布局组装中心。
- **`src/components/ui/`**: 存放基于 shadcn/ui 的基础原子组件（Button, Input, Table 等）。
- **`src/components/panels/`**: 存放构成 IDE 布局的大型面板（EditorPanel, FileTreePanel, RightPanel）。
- **`src/components/features/`**: 存放复杂的业务逻辑模块，按功能进一步细分：
  - `editor/`: 包含实时预览 (`LivePreview`) 等编辑增强组件。
  - `explorer/`: 包含文件树逻辑 (`FileTree`)。
  - `properties/`: 包含元数据、清单及阅读顺序管理器。
- **`src/store/`**: 基于 Zustand 的状态中心，驱动整个工作台的数据流。
- **`src/types/`**: 统一的类型定义，打破模型与逻辑间的循环依赖。

---

## 核心任务追踪

### 第一阶段：基础架构与 UI 模型 [已完成]

- [x] **shadcn/ui 基础组件库**：集成核心组件。
- [x] **三栏式 IDE 布局**：实现文件树、中置编辑器、右侧属性栏。
- [x] **Zustand 状态驱动**：建立符合 OPF 规范的全局状态管理。
- [x] **项目结构标准化**：实现“现代工作台架构”重构。

### 第二阶段：物理文件系统打通 [已完成]

- [x] **原生文件夹打开**：集成 `plugin-dialog`。
- [x] **递归目录读取**：深度扫描本地文件夹。
- [x] **物理重命名 (Rename)**：实现左侧树与物理磁盘同步修改。
- [x] **保存闭环 (Save)**：实现 `Ctrl + S` 物理写入与 `sonner` 提示。

### 第三阶段：逻辑结构与导航自动化 [已完成]

- [x] **TOC 提取工具函数**：已完成层级标题提取算法。
- [x] **OPF 配置文件同步**：实现 `content.opf` 的自动生成与同步持久化。
- [x] **导航文件生成**：完成 `nav.xhtml` 标准生成逻辑。
- [x] **Manifest 管理器**：提供 UI 界面管理文件的资源 ID 与 `media-type`。

### 第四阶段：书籍打包与预览 [进行中]

- [x] **EPUB 导出 (Rust Backend)**：使用 Rust 调用 `zip` 库打包。
- [x] **实时预览面板**：集成侧边栏 Webview，实时渲染章节效果。
- [x] **图片资源预览**：支持在 UI 中查看选中的图片。

### 第五阶段：高级优化与发布 [计划中]

- [ ] **多主题支持**：适配黑暗模式/明亮模式。
- [ ] **文件导入解压**：实现直接打开并解压 `.epub` 文件。
- [ ] **EPUB 校验集成**：集成 EpubCheck 验证。
