export function extractMeetingId(documentName: string) {
  const splitList = documentName.split('__'); // Of the form bn-document__${meetingId}
  return splitList[splitList.length - 1]
}

export function toBoolean(str?: string) {
  return !!str && str.toLocaleLowerCase() === 'true';
}

export function decodeURLEncodedString(str: string): string | null {
  const decoded = new URLSearchParams(`name=${str}`).get("name");
  return decoded;
}
