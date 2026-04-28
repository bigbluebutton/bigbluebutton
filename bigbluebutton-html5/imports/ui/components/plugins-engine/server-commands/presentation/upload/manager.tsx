import { useEffect } from 'react';
import {
  UploadPresentationCommandArguments,
  UploadPresentationContent,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/server-commands/presentation/types';
import {
  PresentationCommandsEnum,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/server-commands/presentation/enum';
import { uniqueId } from '/imports/utils/string-utils';
import PresentationUploaderService from '/imports/ui/components/presentation/presentation-uploader/service';
import logger from '/imports/startup/client/logger';

const toFile = async (
  content: UploadPresentationContent,
  mimeType: string,
  name?: string,
): Promise<File> => {
  const ext = mimeType.split('/')[1] || 'pdf';
  const presentationName = name || `Plugin_Presentation.${ext}`;
  if ('base64' in content) {
    const { base64 } = content;
    const dataUrlMatch = base64.match(/^data:[^;]+;base64,(.+)$/);
    const rawBase64 = dataUrlMatch ? dataUrlMatch[1] : base64;
    const binaryStr = atob(rawBase64);
    const bytes = Uint8Array.from(binaryStr, (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: mimeType });
    return new File([blob], presentationName, { type: mimeType });
  }
  throw new Error('Object type not supported.');
};

const PluginUploadPresentationServerCommandsManager = () => {
  const handleUploadPresentation = ((
    event: CustomEvent<UploadPresentationCommandArguments>,
  ) => {
    toFile(event.detail.content, event.detail.mimeType, event.detail.filename).then((file) => {
      const id = uniqueId(file.name);
      PresentationUploaderService.handleSavePresentation([], false, {
        file,
        presentationId: id,
        isDownloadable: false,
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
  }, []);

  return null;
};

export default PluginUploadPresentationServerCommandsManager;
