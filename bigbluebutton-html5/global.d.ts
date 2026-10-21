// Type declarations for CSS imports
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

// Mermaid's entry file, imported by path where `mermaid` itself is aliased
// (see imports/ui/components/bn-shared-notes/mermaid-on-demand.ts)
declare module 'mermaid/dist/mermaid.core.mjs' {
  export { default } from 'mermaid';
}
