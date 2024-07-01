declare module '@mconf/bbb-diff' {
  declare function patch (prevText: string, attribs: { start: number, end: number, text: string }): string;
}
