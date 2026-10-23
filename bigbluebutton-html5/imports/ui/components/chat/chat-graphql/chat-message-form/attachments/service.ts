import { IntlShape } from 'react-intl';
import { UploadedFile } from '/imports/ui/services/file-upload';

export interface StagedFile {
  id: string;
  file: File;
  // Object URL of the file, only for images (the thumbnail); revoke when unstaged.
  previewUrl: string | null;
}

const BYTES_PER_KB = 1024;
const BYTES_PER_MB = 1024 * 1024;

// The short name users know each allowed type by. A type missing here falls
// back to its mime subtype, so an admin-added type still gets a readable label.
const TYPE_LABELS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
  'video/mp4': 'mp4',
  'audio/mpeg': 'mp3',
};

export const fileTypeLabel = (mime: string): string => TYPE_LABELS[mime] ?? mime.split('/').pop() ?? mime;

export const isImageFile = (file: File): boolean => file.type.startsWith('image/');

export const formatFileSize = (intl: IntlShape, bytes: number): string => {
  if (bytes >= BYTES_PER_MB) {
    return intl.formatNumber(bytes / BYTES_PER_MB, { style: 'unit', unit: 'megabyte', maximumFractionDigits: 1 });
  }
  return intl.formatNumber(Math.max(1, Math.ceil(bytes / BYTES_PER_KB)), { style: 'unit', unit: 'kilobyte' });
};

const escapeLinkText = (text: string): string => text.replace(/[\\[\]]/g, '\\$&');

// What the message body carries for its file: the image itself, or a link to
// the file, so the message reads right wherever the attachment metadata is not
// rendered (and is never empty, which the server rejects).
export const attachmentMarkdown = (uploaded: UploadedFile): string => (
  uploaded.mime.startsWith('image/')
    ? `![image](${uploaded.url})`
    : `[${escapeLinkText(uploaded.name)}](${uploaded.url})`
);

// The longest attachmentMarkdown a file can produce, known before uploading:
// the upload URL is /bigbluebutton/fileUpload/<meetingId>/<36-char uuid>.<ext
// of up to 4 chars>, and the service may append an extension to the name.
export const maxAttachmentMarkdownLength = (file: File, meetingId: string): number => {
  const urlLength = '/bigbluebutton/fileUpload/'.length + meetingId.length + '/'.length + 36 + '.webp'.length;
  return isImageFile(file)
    ? '![image]()'.length + urlLength
    : '[]()'.length + escapeLinkText(file.name).length + '.webp'.length + urlLength;
};

export default {
  fileTypeLabel,
  isImageFile,
  formatFileSize,
  attachmentMarkdown,
  maxAttachmentMarkdownLength,
};
