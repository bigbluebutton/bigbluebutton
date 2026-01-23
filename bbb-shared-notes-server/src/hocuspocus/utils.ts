export function extractMeetingId(documentName: string) {
  const splitList = documentName.split('__'); // Of the form bn-document__${meetingId}
  return splitList[splitList.length - 1]
}

export function toBoolean(str?: string) {
  return !!str && str.toLocaleLowerCase() === 'true';
}
