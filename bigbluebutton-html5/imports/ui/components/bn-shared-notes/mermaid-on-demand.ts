import type { Mermaid, MermaidConfig } from 'mermaid';

// Stands in for `mermaid` (webpack alias) so the diagram block of BlockNote
// downloads Mermaid, the largest part of the shared notes editor, only when a
// diagram is first drawn. The block only calls initialize, parse and render;
// parse and render are already asynchronous.
// The regular client build loads Mermaid as separate chunks. The Safari 14-15
// build stays a single file (LimitChunkCountPlugin in webpack.config.js), so
// there the import below is part of the bundle and nothing loads later.

let config: MermaidConfig | undefined;
let loading: Promise<Mermaid> | undefined;

const loadMermaid = (): Promise<Mermaid> => {
  loading ??= import(/* webpackMode: "lazy" */ 'mermaid/dist/mermaid.core.mjs')
    .then(({ default: mermaid }) => {
      if (config) mermaid.initialize(config);
      return mermaid;
    })
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
    loading?.then((mermaid) => mermaid.initialize(nextConfig)).catch(() => {});
  },
  async parse(...args: Parameters<Mermaid['parse']>): ReturnType<Mermaid['parse']> {
    return (await loadMermaid()).parse(...args);
  },
  async render(...args: Parameters<Mermaid['render']>): ReturnType<Mermaid['render']> {
    return (await loadMermaid()).render(...args);
  },
};

export default mermaidOnDemand;
