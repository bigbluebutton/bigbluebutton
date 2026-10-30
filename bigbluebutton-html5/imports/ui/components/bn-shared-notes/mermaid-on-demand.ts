import type { Mermaid, MermaidConfig } from 'mermaid';

// Stands in for `mermaid` (webpack alias) so the diagram block downloads Mermaid
// only when a diagram is first drawn; the block only calls initialize, parse and
// render. The Safari 14-15 build is a single file, with Mermaid inside.

let config: MermaidConfig | undefined;
let configured = false;
let loading: Promise<Mermaid> | undefined;

// WORKAROUND until https://github.com/TypeCellOS/BlockNote/pull/3219 (theme-aware
// diagrams) lands; remove this light card then. The diagram block cannot redraw
// on a theme switch, and DarkReader would leave light text on light boxes, so
// diagrams always use the light theme on a light card kept out of DarkReader.
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
    // DarkReader skips "stylus" stylesheets. Not "darkreader": it deletes those
    // when dark mode is switched off, stripping the diagram's colors.
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
