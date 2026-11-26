import { UploadedFile } from '/imports/ui/services/file-upload';

export interface StagedFile {
  id: string;
  file: File;
  // Object URL of the file, only for images (the thumbnail); revoke when unstaged.
  previewUrl: string | null;
}

export const isImageFile = (file: File): boolean => file.type.startsWith('image/');

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
  isImageFile,
  attachmentMarkdown,
  maxAttachmentMarkdownLength,
};
