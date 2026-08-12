import {
  UploadPresentationContent,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/server-commands/presentation/types';

const getMaxBytes = (): number => window.meetingClientSettings?.public?.presentation
  ?.mirroredFromBBBCore?.uploadSizeMax ?? 30_000_000;

const assertSize = (bytes: number) => {
  const maxBytes = getMaxBytes();
  if (bytes > maxBytes) {
    throw new Error(`Presentation payload exceeds the maximum allowed size of ${maxBytes} bytes.`);
  }
};

const decodeBase64ToFile = (
  rawBase64: string,
  mimeType: string,
  presentationName: string,
): File => {
  // base64 encodes 3 bytes as 4 chars; this gives the upper-bound decoded size.
  assertSize(Math.ceil((rawBase64.length * 3) / 4));
  const bytes = Uint8Array.from(atob(rawBase64), (c) => c.charCodeAt(0));
  return new File([new Blob([bytes], { type: mimeType })], presentationName, { type: mimeType });
};

// Materializes the content payload of a plugin presentation server-command (file, blob,
// dataUrl or base64) into a File, enforcing the configured upload size limit. Shared by the
// upload and insert-pages command managers.
const toFile = async (
  content: UploadPresentationContent,
  mimeType: string,
  name?: string,
): Promise<File> => {
  const ext = mimeType.split('/')[1] || 'pdf';
  const presentationName = name || `Plugin_Presentation.${ext}`;

  if ('file' in content) {
    assertSize(content.file.size);
    return content.file;
  }

  if ('blob' in content) {
    assertSize(content.blob.size);
    return new File([content.blob], presentationName, { type: mimeType });
  }

  if ('dataUrl' in content) {
    const match = content.dataUrl.match(/^data:[^;]+;base64,(.+)$/);
    if (!match) throw new Error('Invalid or non-base64 dataURL.');
    return decodeBase64ToFile(match[1], mimeType, presentationName);
  }

  if ('base64' in content) {
    return decodeBase64ToFile(content.base64, mimeType, presentationName);
  }

  throw new Error('Object type not supported.');
};

export default toFile;
