// The specs below build DOM nodes: @blocknote/server-util provides a DOM (jsdom)
// while it exports, as for the built-in blocks.
/// <reference lib="dom" />
import {
  BlockNoteSchema,
  createBlockConfig,
  createBlockSpec,
  createInlineContentSpec,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  parsePreCodeContent,
  plainContentToString,
} from "@blocknote/core";
import { ServerBlockNoteEditor } from "@blocknote/server-util";
import katex from "katex";

// Server side of the math and diagram blocks the client registers from
// @blocknote/math-block and @blocknote/diagram-block. The configs (type,
// props, content) match those packages, so documents written by the client
// read back here. The implementations only export: those packages render with
// React and import stylesheets, which this server cannot load.
//
// Math exports as MathML with the LaTeX source in a TeX annotation, like the
// client's copy and paste; the Markdown exporter turns it back into $...$ and
// $$...$$. Diagrams export as their Mermaid source in a fenced code block: the
// diagram is drawn by Mermaid in the browser.

const latexToMathML = (source: string, displayMode: boolean): string =>
  katex.renderToString(source, { output: "mathml", displayMode, throwOnError: false });

const createMathBlockSpec = createBlockSpec(
  createBlockConfig(
    () => ({ type: "mathBlock" as const, propSchema: {}, content: "plain" as const }) as const,
  ),
  {
    meta: { code: true, defining: true, isolating: false },
    render() {
      const dom = document.createElement("div");
      return { dom, contentDOM: dom };
    },
    toExternalHTML(block) {
      const dom = document.createElement("div");
      dom.innerHTML = latexToMathML(plainContentToString(block.content), true);
      return { dom: dom.firstElementChild as HTMLElement ?? dom };
    },
  },
);

const createDiagramBlockSpec = createBlockSpec(
  createBlockConfig(
    () => ({ type: "diagram" as const, propSchema: {}, content: "plain" as const }) as const,
  ),
  {
    meta: { code: true, defining: true, isolating: false },
    // Initial content in Markdown: ```mermaid fences become diagrams, as when
    // the same Markdown is imported in the client.
    parse(element) {
      if (element.tagName !== "PRE" || element.childElementCount !== 1) return undefined;
      const code = element.firstElementChild;
      if (code?.tagName !== "CODE") return undefined;
      const language = code.getAttribute("data-language")
        || [...code.classList].find((name) => name.startsWith("language-"))?.replace("language-", "");
      return language === "mermaid" ? {} : undefined;
    },
    parseContent: (options) => parsePreCodeContent(options, "diagram"),
    runsBefore: ["codeBlock"],
    render() {
      const dom = document.createElement("pre");
      const contentDOM = document.createElement("code");
      dom.appendChild(contentDOM);
      return { dom, contentDOM };
    },
    toExternalHTML() {
      const dom = document.createElement("pre");
      const contentDOM = document.createElement("code");
      contentDOM.className = "language-mermaid";
      contentDOM.setAttribute("data-language", "mermaid");
      dom.appendChild(contentDOM);
      return { dom, contentDOM };
    },
  },
);

const mathInlineContentSpec = createInlineContentSpec(
  { type: "math" as const, propSchema: {}, content: "plain" as const },
  {
    meta: { code: true },
    render() {
      const dom = document.createElement("span");
      return { dom, contentDOM: dom };
    },
    toExternalHTML(inlineContent) {
      const dom = document.createElement("span");
      dom.innerHTML = latexToMathML(plainContentToString(inlineContent.content), false);
      return { dom: dom.firstElementChild as HTMLElement ?? dom };
    },
  },
);

// Media blocks stay in the server schema although the client hides them:
// dropping them here would lose them from documents that already have them.
const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    mathBlock: createMathBlockSpec(),
    diagram: createDiagramBlockSpec(),
  },
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    math: mathInlineContentSpec,
  },
});

export const createServerEditor = () => ServerBlockNoteEditor.create({ schema });

export type ServerEditor = ReturnType<typeof createServerEditor>;
