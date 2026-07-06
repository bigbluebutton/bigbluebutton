import Auth from '/imports/ui/services/auth';
import logger from '/imports/startup/client/logger';
import { uniqueId } from '/imports/utils/string-utils';
import PresentationUploaderService from '/imports/ui/components/actions-bar/media-area/media-sharing/presentation/service';

const POD_ID = 'DEFAULT_PRESENTATION_POD';

/**
 * Uploads a file and asks the server to splice its converted pages into the given (current)
 * presentation at a 1-based position. Reuses the standard presentation upload token flow; the
 * extra multipart fields (insertAtPosition, targetPresentationId) route the upload to the insert
 * path in bbb-web instead of surfacing as a new presentation.
 */
export const insertPages = async (
  file: File, position: number, targetPresentationId: string,
): Promise<void> => {
  const meetingId = Auth.meetingID as string;
  const temporaryPresentationId = uniqueId(file.name);
  const endpoint = window.meetingClientSettings.public.presentation.uploadEndpoint;

  try {
    const token = await PresentationUploaderService.requestPresentationUploadToken(
      temporaryPresentationId, meetingId, file.name,
    );

    const data = new FormData();
    data.append('fileUpload', file);
    data.append('conference', meetingId);
    data.append('room', meetingId);
    data.append('temporaryPresentationId', temporaryPresentationId);
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
        logCode: 'plugin_presentation_insert_pages',
        extraInfo: { status: response.status, response: text },
      }, 'Insert pages upload failed');
    }
  } catch (error) {
    logger.error({
      logCode: 'plugin_presentation_insert_pages',
      extraInfo: { error: (error as Error)?.message },
    }, 'Insert pages upload exception');
  }
};

export default { insertPages };
