import hocuspocus from "../../hocuspocus";
import { ServerBlockNoteEditor } from "@blocknote/server-util";

async function exportDocumentToHtml(documentName: string): Promise<string> {
  const connection = await hocuspocus.openDirectConnection(documentName);
  const doc = connection.document;

  if (!doc) {
    await connection.disconnect();
    throw new Error('document_not_found');
  }

  const fragment = doc.getXmlFragment("doc");

  // Check if document is empty
  if (fragment.length === 0) {
    await connection.disconnect();
    throw new Error('document_empty');
  }

  // Create a ServerBlockNoteEditor instance
  const editor = ServerBlockNoteEditor.create();

  // Convert Yjs XML Fragment to BlockNote blocks
  const blocks = editor.yXmlFragmentToBlocks(fragment);

  // Convert blocks to HTML (using type assertion to handle schema differences)
  let htmlContent = await editor.blocksToHTMLLossy(blocks as any);

  // Replace empty paragraph tags with paragraphs containing a <br> tag
  // This ensures empty lines are preserved in the HTML output
  htmlContent = htmlContent.replaceAll('<p></p>', '<p><br></p>');

  await connection.disconnect();

  // Create HTML document with styling
  const fullHtml = [
      '<!DOCTYPE html>',
      '<html>',
      '<head>',
      '<meta charset="UTF-8">',
      `<title>${documentName}</title>`,
      '<style>',
      'body {',
      '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;',
      '  line-height: 1.6;',
      '  margin: 0 auto;',
      '  padding: 10mm;',
      '}',
      'h1, h2, h3, h4, h5, h6 {',
      '  margin-top: 24px;',
      '  margin-bottom: 16px;',
      '  font-weight: 600;',
      '  line-height: 1.25;',
      '}',
      'h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }',
      'h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }',
      'h3 { font-size: 1.25em; }',
      'p { margin-bottom: 16px; }',
      '/* ol keeps its native numbers; ul uses none so we can suppress bullets on checklists */',
      'ol { padding-left: 2em; margin-bottom: 16px; }',
      'ul { padding-left: 2em; margin-bottom: 16px; list-style: none; }',
      '/* Restore disc bullet only for regular list items where <p> is the first child.',
      '   Checkbox items have <input> as the first child, so :first-child never matches them. */',
      String.raw`ul > li > p.bn-inline-content:first-child::before { content: "\2022\00A0"; }`,
      'li { margin-bottom: 4px; }',
      'code {',
      '  background-color: #f6f8fa;',
      '  padding: 0.2em 0.4em;',
      '  border-radius: 3px;',
      '  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;',
      '  font-size: 85%;',
      '}',
      'pre {',
      '  background-color: #f6f8fa;',
      '  padding: 16px;',
      '  border-radius: 6px;',
      '  overflow: auto;',
      '}',
      'pre code {',
      '  background-color: transparent;',
      '  padding: 0;',
      '}',
      'blockquote {',
      '  border-left: 4px solid #dfe2e5;',
      '  padding-left: 16px;',
      '  color: #6a737d;',
      '  margin-left: 0;',
      '}',
      'table {',
      '  border-collapse: collapse;',
      '  width: 100%;',
      '  margin-bottom: 16px;',
      '}',
      'table th, table td {',
      '  border: 1px solid #dfe2e5;',
      '  padding: 8px 13px;',
      '}',
      'table th {',
      '  background-color: #f6f8fa;',
      '  font-weight: 600;',
      '}',
      '/* wkhtmltopdf uses old WebKit which does not support :has(). */',
      '/* Use adjacent sibling selector to place checkbox and text on the same line. */',
      'input[type="checkbox"] {',
      '  vertical-align: middle;',
      '  margin-right: 6px;',
      '}',
      'input[type="checkbox"] + p.bn-inline-content {',
      '  display: inline;',
      '  margin: 0;',
      '  vertical-align: middle;',
      '}',
      'li[data-checked="true"] > p.bn-inline-content {',
      '  text-decoration: line-through;',
      '}',
      '</style>',
      '</head>',
      '<body>',
      htmlContent,
      '</body>',
      '</html>'
  ].join('\n');
  return fullHtml;
}

export { exportDocumentToHtml };
