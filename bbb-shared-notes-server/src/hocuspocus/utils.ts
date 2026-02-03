export const documentNamePrefix = 'bn-document__';

export function extractMeetingId(documentName: string) {
  return documentName.startsWith(documentNamePrefix)
    ? documentName.slice(documentNamePrefix.length)
    : documentName;
}

export function toBoolean(str?: string) {
  return !!str && str.toLocaleLowerCase() === 'true';
}

export function decodeURLEncodedString(str: string): string | null {
  const decoded = new URLSearchParams(`name=${str}`).get("name");
  return decoded;
}
