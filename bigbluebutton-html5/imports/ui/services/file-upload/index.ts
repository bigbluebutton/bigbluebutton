import Auth from '/imports/ui/services/auth';

const UPLOAD_ENDPOINT = '/bigbluebutton/fileUpload/upload';

export type UploadImageErrorReason =
  | 'unsupported-type'
  | 'too-large'
  | 'image-too-large'
  | 'quota-exceeded'
  | 'upload-failed';

export interface ImageDimensionsDetail {
  maxWidth: number;
  maxHeight: number;
  sentWidth: number;
  sentHeight: number;
  [key: string]: number;
}

export class UploadImageError extends Error {
  public readonly reason: UploadImageErrorReason;

  public readonly dimensions?: ImageDimensionsDetail;

  constructor(
    reason: UploadImageErrorReason,
    message?: string,
    dimensions?: ImageDimensionsDetail,
  ) {
    super(message ?? reason);
    this.name = 'UploadImageError';
    this.reason = reason;
    this.dimensions = dimensions;
  }
}

interface FileUploadLimits {
  maxFileSizeKb: number;
  allowedMimeTypes: string[];
}

const getLimits = (): FileUploadLimits => {
  const { maxFileSizeKb, allowedMimeTypes } = window.meetingClientSettings.public.fileUpload;
  return { maxFileSizeKb, allowedMimeTypes };
};

// Client-side checks are for UX only (fail fast, friendly message). The
// bbb-file-upload service enforces the same limits authoritatively via magic
// bytes and pixel dimensions, so a crafted request cannot bypass them here.
export const isAllowedImage = (file: File): boolean => {
  return getLimits().allowedMimeTypes.includes(file.type);
};

export const isWithinSizeLimit = (file: File): boolean => {
  return file.size <= getLimits().maxFileSizeKb * 1024;
};

// Map the server's stable error `code` (the canonical machine-readable reason)
// to the client's UploadImageErrorReason. The server is the source of truth;
// the client decides the localized message via the reason + details.
const SERVER_CODE_TO_REASON: Record<string, UploadImageErrorReason> = {
  unsupported_image_type: 'unsupported-type',
  file_too_large: 'too-large',
  meeting_quota_exceeded: 'quota-exceeded',
  image_dimensions_exceed_maximum: 'image-too-large',
  unreadable_dimensions: 'unsupported-type',
  storage_failed: 'upload-failed',
};

/**
 * Uploads an image to the meeting-scoped bbb-file-upload service and returns the
 * relative URL to reference it (e.g. /bigbluebutton/fileUpload/{meetingId}/{uuid}.png).
 * The session is authenticated by the nginx auth_request, which reads the
 * sessionToken from the query string, exactly like the presentation upload.
 */
export const uploadImage = async (file: File): Promise<string> => {
  if (!isAllowedImage(file)) {
    throw new UploadImageError('unsupported-type');
  }
  if (!isWithinSizeLimit(file)) {
    throw new UploadImageError('too-large');
  }

  const formData = new FormData();
  formData.append('file', file);

  const endpoint = `${UPLOAD_ENDPOINT}?sessionToken=${Auth.sessionToken}`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
    });
  } catch (error) {
    throw new UploadImageError('upload-failed', error instanceof Error ? error.message : undefined);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { code?: string } | null;
    const code = body?.code ?? '';
    const reason = SERVER_CODE_TO_REASON[code] ?? 'upload-failed';
    const dimensions: ImageDimensionsDetail | undefined = reason === 'image-too-large' && body ? {
      maxWidth: Number((body as { maxWidth?: unknown }).maxWidth ?? 0),
      maxHeight: Number((body as { maxHeight?: unknown }).maxHeight ?? 0),
      sentWidth: Number((body as { sentWidth?: unknown }).sentWidth ?? 0),
      sentHeight: Number((body as { sentHeight?: unknown }).sentHeight ?? 0),
    } : undefined;
    throw new UploadImageError(reason, code || `status ${response.status}`, dimensions);
  }

  const body = await response.json();
  if (typeof body?.url !== 'string') {
    throw new UploadImageError('upload-failed', 'missing url in response');
  }
  return body.url;
};
