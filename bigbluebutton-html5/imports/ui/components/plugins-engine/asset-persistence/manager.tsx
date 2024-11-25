import { AssetPersistenceDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/asset-persistence/types';
import { AssetPersistenceEvents, AssetType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/asset-persistence/enums';
import PresentationUploaderService from '/imports/ui/components/presentation/presentation-uploader/service';
import { useEffect } from 'react';

function urlToFile(url: string, fileName?: string): Promise<File> {
  const filenameToBeUploaded = fileName ?? url.split('/').pop() ?? 'default.pdf';
  return fetch(url).then((response) => response.blob()).then((blob) => {
    const file: File = new File([blob], filenameToBeUploaded, { type: blob.type });
    return file;
  });
}

const PersistAssets = () => {
  const handlePersistAsset: EventListener = (
    (event: CustomEvent<AssetPersistenceDetails>) => {
      const { detail: eventDetail } = event;
      if (eventDetail.typeOfAsset === AssetType.PRESENTATION) {
        urlToFile(eventDetail.assetUrl, eventDetail.assetName).then((file: File) => {
          const fileObject = PresentationUploaderService.createUploadFileObject(file);
          PresentationUploaderService.uploadAndConvertPresentation(
            fileObject.file, fileObject.downloadable,
            fileObject.meetingId,
            fileObject.endpoint,
            fileObject.onUpload,
            fileObject.onProgress,
            fileObject.onConversion,
            fileObject.current,
          );
        });
      }
    }) as EventListener;

  useEffect(() => {
    window.addEventListener(AssetPersistenceEvents.ASSET_PERSISTED, handlePersistAsset);
    return () => {
      window.removeEventListener(AssetPersistenceEvents.ASSET_PERSISTED, handlePersistAsset);
    };
  }, []);
  return null;
};

export default PersistAssets;
