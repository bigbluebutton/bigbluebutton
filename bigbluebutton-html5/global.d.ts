// Type declarations for CSS imports
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

// Mermaid by path, as `mermaid` is aliased to bn-shared-notes/mermaid-on-demand.ts
declare module 'mermaid/dist/mermaid.core.mjs' {
  export { default } from 'mermaid';
}
