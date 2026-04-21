/**
 * 目录节点接口
 */
export interface TocNode {
  title: string;
  id: string;
  level: number;
  children: TocNode[];
}

/**
 * 从 XHTML 字符串中提取层级目录结构 (<h1> - <h6>)
 * 
 * @param xhtml XHTML 内容字符串
 * @returns 树状结构的目录数组
 */
export function extractTocFromXhtml(xhtml: string): TocNode[] {
  if (!xhtml) return [];

  const parser = new DOMParser();
  // 使用 application/xhtml+xml 以符合 EPUB 规范
  const doc = parser.parseFromString(xhtml, 'application/xhtml+xml');
  
  // 检查是否解析出错（有些浏览器会在出错时生成 parsererror 节点）
  if (doc.getElementsByTagName('parsererror').length > 0) {
    console.warn('XHTML parsing error, falling back to text/html');
    // 如果严格模式失败，回退到普通 HTML 解析
    const fallbackDoc = parser.parseFromString(xhtml, 'text/html');
    return buildTocTree(fallbackDoc);
  }

  return buildTocTree(doc);
}

/**
 * 内部函数：遍历 DOM 树构建 TocTree
 */
function buildTocTree(doc: Document): TocNode[] {
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const root: TocNode[] = [];
  const stack: TocNode[] = [];

  headings.forEach((heading) => {
    const level = parseInt(heading.tagName.substring(1));
    const node: TocNode = {
      title: heading.textContent?.trim() || 'Untitled',
      id: heading.id || '', // 注意：EPUB 目录跳转通常需要 ID
      level: level,
      children: [],
    };

    // 寻找合适的父节点位置
    // 如果 stack 顶部的层级大于或等于当前层级，则继续出栈直到找到父层级
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    if (stack.length === 0) {
      // 说明是当前分支的最顶级（例如 H1）
      root.push(node);
    } else {
      // 挂载到父节点的 children 下
      stack[stack.length - 1].children.push(node);
    }

    // 将当前节点入栈
    stack.push(node);
  });

  return root;
}
