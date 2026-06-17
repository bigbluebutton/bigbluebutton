import { useEffect } from 'react';
import {
  UploadPresentationCommandArguments,
  UploadPresentationContent,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/server-commands/presentation/types';
import {
  PresentationCommandsEnum,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/server-commands/presentation/enum';
import { uniqueId } from '/imports/utils/string-utils';
import PresentationUploaderService from '/imports/ui/components/actions-bar/media-area/media-sharing/presentation/service';
import logger from '/imports/startup/client/logger';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

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

const isValidUploadEvent = (event: CustomEvent<UploadPresentationCommandArguments>) => {
  if (
    !(event instanceof CustomEvent)
      || event.detail == null
      || typeof event.detail.mimeType !== 'string'
      || event.detail.content == null
  ) {
    return false;
  }
  return true;
};

const PluginUploadPresentationServerCommandsManager = () => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    presenter: user.presenter,
  }));

  const handleUploadPresentation = ((
    event: CustomEvent<UploadPresentationCommandArguments>,
  ) => {
    if (!currentUserData?.presenter) {
      logger.warn({
        logCode: 'plugin_presentation_upload_not_allowed',
      }, 'Plugin tried to upload a presentation but user is not a presenter');
      return;
    }
    if (!isValidUploadEvent(event)) {
      logger.error({
        logCode: 'plugin_presentation_upload',
      }, 'Failed to upload presentation from plugin command: malformed event detail');
      return;
    }
    toFile(event.detail.content, event.detail.mimeType, event.detail.filename).then((file) => {
      const id = uniqueId(file.name);
      PresentationUploaderService.handleSavePresentation([], false, {
        file,
        presentationId: id,
        downloadable: false,
        isRemovable: true,
        name: file.name,
        current: true,
        conversion: { done: false, error: false },
        upload: { done: false, error: false, progress: 0 },
        exportation: { isRunning: false, error: false },
        onConversion: () => {},
        onUpload: () => {},
        onProgress: () => {},
        onDone: () => {},
      }, undefined, () => {}, undefined, true);
    }).catch((error) => {
      logger.error({
        logCode: 'plugin_presentation_upload',
        extraInfo: { error },
      }, 'Failed to upload presentation from plugin command');
    });
  }) as EventListener;

  useEffect(() => {
    window.addEventListener(PresentationCommandsEnum.UPLOAD, handleUploadPresentation);
    return () => {
      window.removeEventListener(PresentationCommandsEnum.UPLOAD, handleUploadPresentation);
    };
  }, [currentUserData]);

  return null;
};

export default PluginUploadPresentationServerCommandsManager;
