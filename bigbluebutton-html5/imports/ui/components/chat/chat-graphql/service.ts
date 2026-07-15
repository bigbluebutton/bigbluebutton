const lineBreakingTags = new Set(['P', 'DIV', 'PRE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'TABLE', 'TR', 'TD']);

// Truncates the subtree at the first visual line break: a newline inside a
// text node (rendered as a break by `white-space: pre-wrap`), a <br>, or the
// end of the first nested line-breaking element. Returns true when the line
// ended inside the given node, so callers must drop the siblings that follow.
const truncateAtFirstLineBreak = (node: Node): boolean => {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || '';
    // whitespace-only nodes are markup formatting between elements, not a visual break
    if (!text.trim()) return false;
    const newlineIndex = text.indexOf('\n');
    if (newlineIndex === -1) return false;
    // eslint-disable-next-line no-param-reassign
    node.textContent = text.slice(0, newlineIndex);
    return true;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return false;

  const element = node as Element;
  if (element.tagName === 'BR') {
    element.remove();
    return true;
  }

  let lineEnded = false;
  Array.from(element.childNodes).forEach((child) => {
    if (lineEnded) {
      child.remove();
      return;
    }
    lineEnded = truncateAtFirstLineBreak(child)
      || (child.nodeType === Node.ELEMENT_NODE && lineBreakingTags.has((child as Element).tagName));
  });

  return lineEnded;
};

export const getFirstVisibleLineHtml = (htmlContent: string): string => {
  if (!htmlContent.trim()) return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const root = doc.body.firstElementChild;
  if (!root) return '';

  truncateAtFirstLineBreak(root);

  return root.outerHTML;
};

export default {
  getFirstVisibleLineHtml,
};
