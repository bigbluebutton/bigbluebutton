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

  // Strip hardcoded inline color styles from BlockNote color spans.
  // The data-style-type / data-value attributes remain, and the CSS below
  // re-applies the colors via variables so they adapt to light / dark theme.
  htmlContent = htmlContent.replace(
    /<span\b([^>]*)>/g,
    (match, attrs) => {
      if (/\bdata-style-type=/.test(attrs)) {
        return `<span${attrs.replace(/\s*style="[^"]*"/, '')}>`;
      }
      return match;
    }
  );

  await connection.disconnect();

  // Create HTML document with styling
  const fullHtml = [
      '<!DOCTYPE html>',
      '<html>',
      '<head>',
      '<meta charset="UTF-8">',
      `<title>${documentName}</title>`,
      '<style>',
      ':root {',
      '  --bn-text-gray: #9b9a97;',
      '  --bn-text-brown: #64473a;',
      '  --bn-text-red: #e03e3e;',
      '  --bn-text-orange: #d9730d;',
      '  --bn-text-yellow: #dfab01;',
      '  --bn-text-green: #4d6461;',
      '  --bn-text-blue: #0b6e99;',
      '  --bn-text-purple: #6940a5;',
      '  --bn-text-pink: #ad1a72;',
      '  --bn-bg-gray: #ebeced;',
      '  --bn-bg-brown: #e9e5e3;',
      '  --bn-bg-red: #fbe4e4;',
      '  --bn-bg-orange: #f6e9d9;',
      '  --bn-bg-yellow: #fbf3db;',
      '  --bn-bg-green: #ddedea;',
      '  --bn-bg-blue: #ddebf1;',
      '  --bn-bg-purple: #eae4f2;',
      '  --bn-bg-pink: #f4dfeb;',
      '}',
      'html.dark {',
      '  --bn-text-gray: #bebdb8;',
      '  --bn-text-brown: #8e6552;',
      '  --bn-text-red: #ec4040;',
      '  --bn-text-orange: #e3790d;',
      '  --bn-text-yellow: #dfab01;',
      '  --bn-text-green: #6b8b87;',
      '  --bn-text-blue: #0e87bc;',
      '  --bn-text-purple: #8552d7;',
      '  --bn-text-pink: #da208f;',
      '  --bn-bg-gray: #9b9a97;',
      '  --bn-bg-brown: #64473a;',
      '  --bn-bg-red: #be3434;',
      '  --bn-bg-orange: #b7600a;',
      '  --bn-bg-yellow: #b58b00;',
      '  --bn-bg-green: #4d6461;',
      '  --bn-bg-blue: #0b6e99;',
      '  --bn-bg-purple: #6940a5;',
      '  --bn-bg-pink: #ad1a72;',
      '}',
      'html.dark body {',
      '  background-color: #1f1f1f;',
      '  color: #cfcfcf;',
      '}',
      '[data-style-type="textColor"][data-value="gray"]   { color: var(--bn-text-gray); }',
      '[data-style-type="textColor"][data-value="brown"]  { color: var(--bn-text-brown); }',
      '[data-style-type="textColor"][data-value="red"]    { color: var(--bn-text-red); }',
      '[data-style-type="textColor"][data-value="orange"] { color: var(--bn-text-orange); }',
      '[data-style-type="textColor"][data-value="yellow"] { color: var(--bn-text-yellow); }',
      '[data-style-type="textColor"][data-value="green"]  { color: var(--bn-text-green); }',
      '[data-style-type="textColor"][data-value="blue"]   { color: var(--bn-text-blue); }',
      '[data-style-type="textColor"][data-value="purple"] { color: var(--bn-text-purple); }',
      '[data-style-type="textColor"][data-value="pink"]   { color: var(--bn-text-pink); }',
      '[data-style-type="backgroundColor"][data-value="gray"]   { background-color: var(--bn-bg-gray); }',
      '[data-style-type="backgroundColor"][data-value="brown"]  { background-color: var(--bn-bg-brown); }',
      '[data-style-type="backgroundColor"][data-value="red"]    { background-color: var(--bn-bg-red); }',
      '[data-style-type="backgroundColor"][data-value="orange"] { background-color: var(--bn-bg-orange); }',
      '[data-style-type="backgroundColor"][data-value="yellow"] { background-color: var(--bn-bg-yellow); }',
      '[data-style-type="backgroundColor"][data-value="green"]  { background-color: var(--bn-bg-green); }',
      '[data-style-type="backgroundColor"][data-value="blue"]   { background-color: var(--bn-bg-blue); }',
      '[data-style-type="backgroundColor"][data-value="purple"] { background-color: var(--bn-bg-purple); }',
      '[data-style-type="backgroundColor"][data-value="pink"]   { background-color: var(--bn-bg-pink); }',
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
