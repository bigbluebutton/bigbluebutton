export const sanitizeFilenameSegment = (value: string): string =>
  value
    .replace(/\s/g, '_')
    .replace(/[^a-z0-9_.-]/gi, '_');
