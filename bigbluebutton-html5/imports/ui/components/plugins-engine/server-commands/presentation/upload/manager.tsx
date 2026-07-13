import { useEffect } from 'react';
import {
  UploadPresentationCommandArguments,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/server-commands/presentation/types';
import {
  PresentationCommandsEnum,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/server-commands/presentation/enum';
import { uniqueId } from '/imports/utils/string-utils';
import PresentationUploaderService from '/imports/ui/components/actions-bar/media-area/media-sharing/presentation/service';
import logger from '/imports/startup/client/logger';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { toFile } from '../content-to-file';

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
