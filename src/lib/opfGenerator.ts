import {
  type EpubMetadata,
  type EpubManifestItem,
  type EpubSpineItem,
} from "@/types/epub"
import { type TocNode } from "./epubUtils"

/**
 * 生成 content.opf 内容
 */
export function generateOpf(
  metadata: EpubMetadata,
  manifest: EpubManifestItem[],
  spine: EpubSpineItem[]
): string {
  const modifiedDate = new Date().toISOString().split(".")[0] + "Z"

  const manifestItems = manifest
    .map(
      (item) =>
        `    <item id="${item.id}" href="${item.href}" media-type="${item.mediaType}"${item.properties ? ` properties="${item.properties}"` : ""} />`
    )
    .join("\n")

  const spineItems = spine
    .map(
      (item) =>
        `    <itemref idref="${item.idref}"${item.linear ? ` linear="${item.linear}"` : ""} />`
    )
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${metadata.title}</dc:title>
    <dc:creator id="creator">${metadata.creator}</dc:creator>
    <dc:identifier id="pub-id">${metadata.identifier || "urn:uuid:" + Math.random().toString(36).substring(7)}</dc:identifier>
    <dc:language>${metadata.language}</dc:language>
    <meta property="dcterms:modified">${modifiedDate}</meta>
    ${metadata.description ? `<dc:description>${metadata.description}</dc:description>` : ""}
    ${metadata.publisher ? `<dc:publisher>${metadata.publisher}</dc:publisher>` : ""}
  </metadata>
  <manifest>
${manifestItems}
  </manifest>
  <spine>
${spineItems}
  </spine>
</package>`
}

/**
 * 生成 nav.xhtml 内容 (EPUB 3 导航)
 */
export function generateNav(title: string, tocNodes: TocNode[]): string {
  const renderList = (nodes: TocNode[]): string => {
    if (nodes.length === 0) return ""
    return `<ol>
      ${nodes
        .map(
          (node) => `
        <li>
          <a href="${node.id ? "#" + node.id : ""}">${node.title}</a>
          ${node.children.length > 0 ? renderList(node.children) : ""}
        </li>
      `
        )
        .join("")}
    </ol>`
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
  <head>
    <title>${title}</title>
    <meta charset="utf-8" />
  </head>
  <body>
    <nav epub:type="toc" id="toc">
      <h1>${title}</h1>
      ${renderList(tocNodes)}
    </nav>
  </body>
</html>`
}
