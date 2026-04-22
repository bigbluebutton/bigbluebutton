export const getFirstVisibleLineHtml = (htmlContent: string): string => {
  if (!htmlContent.trim()) return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const root = doc.body.firstElementChild;
  if (!root) return '';

  const displayBlockTags = new Set(['P', 'A', 'DIV', 'PRE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'TABLE', 'TR', 'TD', 'CODE']);

  const children = Array.from(root.childNodes);
  let keptBlocks = 0;

  for (let i = children.length - 1; i >= 0; i -= 1) {
    const node = children[i];

    if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = (node as Element).tagName.toUpperCase();
      if (displayBlockTags.has(tagName)) {
        if (keptBlocks === 0) {
          keptBlocks = 1;
        } else {
          node.remove();
        }
      } else if (keptBlocks > 0) {
        node.remove();
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      if (keptBlocks > 0) {
        node.remove();
      } else {
        const text = node.textContent || '';
        const firstLine = text.split(/\n/)[0];
        node.textContent = firstLine;
      }
    }
  }

  return root.outerHTML;
};

export default {
  getFirstVisibleLineHtml,
};
