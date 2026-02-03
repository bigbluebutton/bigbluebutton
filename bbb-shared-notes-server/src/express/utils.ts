import { IncomingHttpHeaders } from "http";
import { toBoolean } from "../common/utils";
import { UserInformation } from "../hocuspocus/type";

export function validateInitialContentJson(body: any): { valid: boolean; error?: string } {
  // Check if body has blocks property
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Body must be an object" };
  }

  if (!body.blocks || !Array.isArray(body.blocks)) {
    return { valid: false, error: "Body must contain a 'blocks' array" };
  }

  const blocks = body.blocks;

  // Validate each block
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    // Check required fields
    if (!block.id || typeof block.id !== "string") {
      return { valid: false, error: `Block at index ${i} is missing valid 'id' field` };
    }

    if (!block.type || typeof block.type !== "string") {
      return { valid: false, error: `Block at index ${i} is missing valid 'type' field` };
    }

    // Check props object
    if (!block.props || typeof block.props !== "object") {
      return { valid: false, error: `Block at index ${i} is missing 'props' object` };
    }

    const { props } = block;
    if (typeof props.backgroundColor !== "string") {
      return { valid: false, error: `Block at index ${i} props.backgroundColor must be a string` };
    }

    if (typeof props.textColor !== "string") {
      return { valid: false, error: `Block at index ${i} props.textColor must be a string` };
    }

    if (typeof props.textAlignment !== "string") {
      return { valid: false, error: `Block at index ${i} props.textAlignment must be a string` };
    }

    // Validate content if present
    if (block.content !== undefined) {
      if (!Array.isArray(block.content)) {
        return { valid: false, error: `Block at index ${i} content must be an array` };
      }

      for (let j = 0; j < block.content.length; j++) {
        const content = block.content[j];

        if (!content.type || typeof content.type !== "string") {
          return { valid: false, error: `Block at index ${i}, content at index ${j} is missing valid 'type' field` };
        }

        if (!content.text || typeof content.text !== "string") {
          return { valid: false, error: `Block at index ${i}, content at index ${j} is missing valid 'text' field` };
        }

        if (content.styles !== undefined && typeof content.styles !== "object") {
          return { valid: false, error: `Block at index ${i}, content at index ${j} styles must be an object` };
        }

        // Validate link type has href
        if (content.type === "link" && (!content.href || typeof content.href !== "string")) {
          return { valid: false, error: `Block at index ${i}, content at index ${j} with type 'link' must have valid 'href' field` };
        }
      }
    }

    // Validate children if present (recursive structure)
    if (block.children !== undefined) {
      if (!Array.isArray(block.children)) {
        return { valid: false, error: `Block at index ${i} children must be an array` };
      }

      // Recursively validate children (wrap in blocks structure)
      const childrenValidation = validateInitialContentJson({ blocks: block.children });
      if (!childrenValidation.valid) {
        return { valid: false, error: `Block at index ${i} - ${childrenValidation.error}` };
      }
    }
  }

  return { valid: true };
}

export function decodeURLEncodedString(str: string): string | null {
  const decoded = new URLSearchParams(`name=${str}`).get("name");
  return decoded;
}

export function validateHeaderInformation(headers: IncomingHttpHeaders): boolean {
  const checkHeaders = () => (
    'user-external-id' in headers
    && 'user-id' in headers
    && 'user-name' in headers
    && 'meeting-id' in headers
    && 'user-is-moderator' in headers
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
    userId: headers['user-external-id'] as string,
    intUserId: headers['user-id'] as string,
    userName,
    meetingId: headers['meeting-id'] as string,
    userIsModerator: toBoolean(headers['user-is-moderator'] as string),
    userHasNotesEnabled: toBoolean(headers['user-notes-enabled'] as string),
  }
  return userInfo
}
