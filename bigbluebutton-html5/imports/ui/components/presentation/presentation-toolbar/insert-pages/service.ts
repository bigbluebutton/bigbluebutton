import Auth from '/imports/ui/services/auth';
import logger from '/imports/startup/client/logger';
import { uniqueId } from '/imports/utils/string-utils';
import PresentationUploaderService from '/imports/ui/components/actions-bar/media-area/media-sharing/presentation/service';

const POD_ID = 'DEFAULT_PRESENTATION_POD';

// Fetches the server-hosted blank.pdf asset (same 16:9 ratio as default.pdf, served from the
// nginx assets root) as a File, so a blank slide is inserted through the regular presentation
// conversion pipeline instead of being synthesized on the client.
export const fetchBlankPageFile = async (): Promise<File> => {
  const response = await fetch('/blank.pdf');
  if (!response.ok) {
    throw new Error(`Could not load the blank page asset (HTTP ${response.status}).`);
  }
  const blob = await response.blob();
  return new File([blob], 'blank.pdf', { type: 'application/pdf' });
};

/**
 * Uploads a file and asks the server to splice its converted pages into the given (current)
 * presentation at a 1-based position. Reuses the standard presentation upload-token flow; the
 * extra multipart fields (insertAtPosition, targetPresentationId) route the upload to the insert
 * path in bbb-web instead of surfacing as a new presentation. Throws on failure so callers can
 * react: the native toolbar toasts and rolls back its optimistic UI, the plugin server-command
 * manager (plugins-engine/server-commands/presentation/insert-pages/manager.tsx, the other
 * consumer) logs and drops the command.
 */
export const insertPagesUpload = async (
  file: File, position: number, targetPresentationId: string, insertRequestId = uniqueId(file.name),
): Promise<void> => {
  const meetingId = Auth.meetingID as string;
  const endpoint = window.meetingClientSettings.public.presentation.uploadEndpoint;

  const token = await PresentationUploaderService.requestPresentationUploadToken(
    insertRequestId, meetingId, file.name,
  );

  const data = new FormData();
  data.append('fileUpload', file);
  data.append('conference', meetingId);
  data.append('room', meetingId);
  data.append('temporaryPresentationId', insertRequestId);
  data.append('pod_id', POD_ID);
  data.append('is_downloadable', 'false');
  data.append('current', 'false');
  data.append('insertAtPosition', String(position));
  data.append('targetPresentationId', targetPresentationId);

  const response = await fetch(endpoint.replace('upload', `${token}/upload`), {
    method: 'POST',
    body: data,
  });
  const text = await response.text();
  if (!response.ok || text !== 'upload-success') {
    logger.error({
      logCode: 'presentation_insert_pages_upload',
      extraInfo: { status: response.status, response: text },
    }, 'Native insert pages upload failed');
    throw new Error(text || `Upload failed (HTTP ${response.status}).`);
  }
};

// Builds the accept attribute for the OS file picker from the configured upload mime types.
export const buildAcceptAttribute = (): string => {
  const mimeTypes = window.meetingClientSettings?.public?.presentation?.uploadValidMimeTypes ?? [];
  return mimeTypes
    .flatMap((t: { extension?: string; mime?: string }) => [t.extension, t.mime])
    .filter(Boolean)
    .join(',');
};
