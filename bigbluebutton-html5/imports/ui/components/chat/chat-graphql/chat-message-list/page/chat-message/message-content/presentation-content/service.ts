import Auth from '/imports/ui/services/auth';

interface PresentationMetadata {
  fileURI: string;
  filename: string;
}

function assertAsPresentationMetadata(metadata: unknown): asserts metadata is PresentationMetadata {
  if (typeof metadata !== 'object' || metadata === null) {
    throw new Error('metadata is not an object');
  }
  if (typeof (metadata as PresentationMetadata).fileURI !== 'string') {
    throw new Error('metadata.fileURI is not a string');
  }
  if (typeof (metadata as PresentationMetadata).filename !== 'string') {
    throw new Error('metadata.filename is not a string');
  }
}

const getPresentationDownloadData = (metadata: string) => {
  const presentationData = JSON.parse(metadata) as unknown;
  assertAsPresentationMetadata(presentationData);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const APP_CONFIG = window.meetingClientSettings.public.app;
  const downloadUrl = Auth.authenticateURL(`${APP_CONFIG.bbbWebBase}/${presentationData.fileURI}`);
  const absoluteDownloadUrl = new URL(downloadUrl, window.location.origin).toString();

  return {
    absoluteDownloadUrl,
    downloadUrl,
    filename: presentationData.filename,
  };
};

export default getPresentationDownloadData;
