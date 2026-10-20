import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import katex from 'katex';
import { Logger } from './logger';

const logger = new Logger('math');

// Math blocks and inline math export as MathML carrying the LaTeX source in a
// TeX annotation (see src/blocknote/editor.ts). Browsers render that MathML;
// the helpers below cover the outputs that cannot.

const MATH_ELEMENT = /<math\b([^>]*)>([\s\S]*?)<\/math>/g;
const TEX_ANNOTATION = /<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/;

const decodeEntities = (text: string): string => text
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>')
  .replaceAll('&quot;', '"')
  .replaceAll('&#39;', "'")
  .replaceAll('&amp;', '&');

const replaceMath = (
  html: string,
  replace: (tex: string, displayMode: boolean) => string,
): string => html.replaceAll(MATH_ELEMENT, (element, attributes: string, body: string) => {
  const annotation = TEX_ANNOTATION.exec(body);
  if (!annotation) return element;
  return replace(decodeEntities(annotation[1]), /\bdisplay="block"/.test(attributes));
});

/**
 * Plain text keeps the LaTeX source, between $ (inline) or $$ (block).
 */
export const mathToLatexText = (html: string): string => replaceMath(
  html,
  (tex, displayMode) => (displayMode ? `<p>$$${tex}$$</p>` : `$${tex}$`),
);

let katexStylesheet: Promise<string> | undefined;

// wkhtmltopdf only reads what is inside the HTML file, so the KaTeX fonts go in
// as data URIs (WOFF: the PDF engine reads neither WOFF2 nor fetches files).
const loadKatexStylesheet = async (): Promise<string> => {
  const cssPath = fileURLToPath(import.meta.resolve('katex/dist/katex.min.css'));
  const fontsDir = path.join(path.dirname(cssPath), 'fonts');
  const css = await readFile(cssPath, 'utf8');
  const fonts = new Map<string, string>();
  for (const [, name] of css.matchAll(/url\(fonts\/([\w-]+)\.woff\)/g)) {
    fonts.set(name, (await readFile(path.join(fontsDir, `${name}.woff`))).toString('base64'));
  }
  return css.replaceAll(
    /src:url\(fonts\/([\w-]+)\.woff2\) format\("woff2"\),url\(fonts\/\1\.woff\) format\("woff"\),url\(fonts\/\1\.ttf\) format\("truetype"\)/g,
    (_match, name: string) => `src:url(data:font/woff;base64,${fonts.get(name)}) format("woff")`,
  );
};

/**
 * The PDF engine (wkhtmltopdf) does not render MathML: typeset the formulas
 * with KaTeX's HTML output and its stylesheet instead.
 */
export const renderMathForPdf = async (html: string): Promise<string> => {
  if (!html.includes('<math')) return html;
  let css: string;
  try {
    katexStylesheet ??= loadKatexStylesheet();
    css = await katexStylesheet;
  } catch (error) {
    katexStylesheet = undefined;
    logger.warn('KaTeX stylesheet unavailable; math stays as MathML in the PDF', { error });
    return html;
  }
  const typeset = replaceMath(
    html,
    (tex, displayMode) => katex.renderToString(tex, { output: 'html', displayMode, throwOnError: false }),
  );
  return typeset.replace('</head>', `<style>${css}</style>\n</head>`);
};
