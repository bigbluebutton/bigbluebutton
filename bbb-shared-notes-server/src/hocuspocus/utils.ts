export const documentNamePrefix = 'bn-document__';

export function extractMeetingId(documentName: string) {
  return documentName.startsWith(documentNamePrefix)
    ? documentName.slice(documentNamePrefix.length)
    : documentName;
}

export function isValidDocumentName(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (!value.startsWith(documentNamePrefix)) return false;
  const suffix = value.slice(documentNamePrefix.length);
  return /^[A-Za-z0-9_-]+$/.test(suffix);
}
