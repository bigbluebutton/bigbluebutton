import type { Mermaid, MermaidConfig } from 'mermaid';
import { isDarkThemeEnabled } from '/imports/ui/components/app/service';

// Stands in for `mermaid` (webpack alias) so the diagram block of BlockNote
// downloads Mermaid, the largest part of the shared notes editor, only when a
// diagram is first drawn. The block only calls initialize, parse and render;
// parse and render are already asynchronous.
// The regular client build loads Mermaid as separate chunks. The Safari 14-15
// build stays a single file (LimitChunkCountPlugin in webpack.config.js), so
// there the import below is part of the bundle and nothing loads later.

let config: MermaidConfig | undefined;
let appliedTheme: MermaidConfig['theme'];
let loading: Promise<Mermaid> | undefined;

// Mermaid writes its colors into a stylesheet inside the SVG. The client's dark
// mode (DarkReader) treats SVG fills like text and lightens them, which leaves
// light text on light boxes, so in dark mode draw with Mermaid's own dark theme
// (and keep DarkReader off it, see render).
const withClientTheme = (mermaid: Mermaid): Mermaid => {
  const theme = isDarkThemeEnabled() ? 'dark' : 'default';
  if (theme !== appliedTheme) {
    mermaid.initialize({ ...config, theme });
    appliedTheme = theme;
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
    appliedTheme = undefined;
  },
  async parse(...args: Parameters<Mermaid['parse']>): ReturnType<Mermaid['parse']> {
    return withClientTheme(await loadMermaid()).parse(...args);
  },
  async render(...args: Parameters<Mermaid['render']>): ReturnType<Mermaid['render']> {
    const result = await withClientTheme(await loadMermaid()).render(...args);
    if (!isDarkThemeEnabled()) return result;
    // DarkReader recolors every stylesheet it finds, and would turn the dark
    // theme's boxes light again. It leaves alone the sheets marked as its own.
    return { ...result, svg: result.svg.replace('<style>', '<style class="darkreader">') };
  },
};

export default mermaidOnDemand;
