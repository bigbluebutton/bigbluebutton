import { IncomingHttpHeaders } from "node:http";
import { toBoolean } from "../common/utils";
import { UserInformation } from "../hocuspocus/type";

export function decodeURLEncodedString(str: string): string | null {
  const decoded = new URLSearchParams(`name=${str}`).get("name");
  return decoded;
}

export function validateHeaderInformation(headers: IncomingHttpHeaders): boolean {
  const checkHeaders = () => (
    'user-id' in headers
    && 'user-name' in headers
    && 'meeting-id' in headers
  );
  const headersCorrect = checkHeaders();

  if (!headersCorrect) return false;

  // User name comes URL encoded from BBB-Web.
  const userName = decodeURLEncodedString(headers['user-name'] as string)
  if (!userName) return false;

  return true;
}

export function getUserInformation(headers: IncomingHttpHeaders): UserInformation | null {
  const userName = decodeURLEncodedString(headers['user-name'] as string) as string;
  const userInfo: UserInformation = {
    intUserId: headers['user-id'] as string,
    userName,
    meetingId: headers['meeting-id'] as string,
    userHasNotesEnabled: toBoolean(headers['user-notes-enabled'] as string),
  }
  return userInfo
}
