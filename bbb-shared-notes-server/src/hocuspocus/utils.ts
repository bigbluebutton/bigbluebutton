export const documentNamePrefix = 'bn-document__';

export function extractMeetingId(documentName: string) {
  return documentName.startsWith(documentNamePrefix)
    ? documentName.slice(documentNamePrefix.length)
    : documentName;
}
