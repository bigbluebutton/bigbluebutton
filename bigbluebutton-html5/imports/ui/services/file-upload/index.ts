import Auth from '/imports/ui/services/auth';

const UPLOAD_ENDPOINT = '/bigbluebutton/fileUpload/upload';

export type UploadImageErrorReason = 'unsupported-type' | 'too-large' | 'upload-failed';

export class UploadImageError extends Error {
  public readonly reason: UploadImageErrorReason;

  constructor(reason: UploadImageErrorReason, message?: string) {
    super(message ?? reason);
    this.name = 'UploadImageError';
    this.reason = reason;
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

  if (response.status === 413) {
    throw new UploadImageError('too-large');
  }
  if (response.status === 415 || response.status === 422) {
    throw new UploadImageError('unsupported-type');
  }
  if (!response.ok) {
    throw new UploadImageError('upload-failed', `unexpected status ${response.status}`);
  }

  const body = await response.json();
  if (typeof body?.url !== 'string') {
    throw new UploadImageError('upload-failed', 'missing url in response');
  }
  return body.url;
};
