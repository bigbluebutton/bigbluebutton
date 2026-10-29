import type { Mermaid, MermaidConfig } from 'mermaid';

// Stands in for `mermaid` (webpack alias) so the diagram block of BlockNote
// downloads Mermaid, the largest part of the shared notes editor, only when a
// diagram is first drawn. The block only calls initialize, parse and render;
// parse and render are already asynchronous.
// The regular client build loads Mermaid as separate chunks. The Safari 14-15
// build stays a single file (LimitChunkCountPlugin in webpack.config.js), so
// there the import below is part of the bundle and nothing loads later.

let config: MermaidConfig | undefined;
let configured = false;
let loading: Promise<Mermaid> | undefined;

// WORKAROUND until https://github.com/TypeCellOS/BlockNote/pull/3219 lands:
// the diagram block of BlockNote draws with Mermaid's default (light) theme and
// cannot redraw a diagram when the client theme changes. That pull request
// renders diagrams with theme-aware CSS; when it ships, remove this light card
// and let the diagrams follow the theme.
// Until then diagrams are always drawn in the light theme and shown as a light
// card, like an image, also in dark mode. The client's dark mode (DarkReader)
// would lighten the SVG fills and leave light text on light boxes, so the
// diagram's stylesheet is kept out of it (see render). Nothing redraws on a
// theme switch, so the editor keeps its undo history.
const configure = (mermaid: Mermaid): Mermaid => {
  if (!configured) {
    mermaid.initialize({ ...config, theme: 'default' });
    configured = true;
  }
  return mermaid;
};

const loadMermaid = (): Promise<Mermaid> => {
  loading ??= import(/* webpackMode: "lazy" */ 'mermaid/dist/mermaid.core.mjs')
    .then(({ default: mermaid }) => mermaid)
    .catch((error) => {
      // Let the next diagram try again (e.g. after a network hiccup)
      loading = undefined;
      throw error;
    });
  return loading;
};

const mermaidOnDemand = {
  initialize(nextConfig: MermaidConfig): void {
    config = nextConfig;
    configured = false;
  },
  async parse(...args: Parameters<Mermaid['parse']>): ReturnType<Mermaid['parse']> {
    return configure(await loadMermaid()).parse(...args);
  },
  async render(...args: Parameters<Mermaid['render']>): ReturnType<Mermaid['render']> {
    const [id] = args;
    const result = await configure(await loadMermaid()).render(...args);
    // DarkReader leaves alone the stylesheets of the Stylus extension. Not its
    // own "darkreader" class: DarkReader deletes every element with that class
    // when dark mode is switched off, which would strip the diagram's colors.
    return {
      ...result,
      svg: result.svg.replace(
        '<style>',
        `<style class="stylus">#${id}{background:#fff;border-radius:4px;padding:8px}`,
      ),
    };
  },
};

export default mermaidOnDemand;
