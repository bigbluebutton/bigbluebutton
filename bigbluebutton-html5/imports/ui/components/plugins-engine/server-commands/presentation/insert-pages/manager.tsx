import { useEffect } from 'react';
import {
  InsertPagesCommandArguments,
  UploadPresentationContent,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/server-commands/presentation/types';
import {
  PresentationCommandsEnum,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/server-commands/presentation/enum';
import logger from '/imports/startup/client/logger';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { PRESENTATIONS_SUBSCRIPTION } from '/imports/ui/components/whiteboard/queries';
import { insertPages } from './service';

// The command name and argument types come from the plugin SDK, mirroring the sibling
// upload/manager.tsx. Resolving these requires the paired insertPages SDK change, which is not in a
// published release yet; bigbluebutton-html5/package.json references the SDK branch (codeload) until
// it is released, at which point that dep becomes a normal version bump.

const getMaxBytes = (): number => window.meetingClientSettings?.public?.presentation
  ?.mirroredFromBBBCore?.uploadSizeMax ?? 30_000_000;

const assertSize = (bytes: number) => {
  const maxBytes = getMaxBytes();
  if (bytes > maxBytes) {
    throw new Error(`Presentation payload exceeds the maximum allowed size of ${maxBytes} bytes.`);
  }
};

const decodeBase64ToFile = (rawBase64: string, mimeType: string, name: string): File => {
  // base64 encodes 3 bytes as 4 chars; this gives the upper-bound decoded size.
  assertSize(Math.ceil((rawBase64.length * 3) / 4));
  const bytes = Uint8Array.from(atob(rawBase64), (c) => c.charCodeAt(0));
  return new File([new Blob([bytes], { type: mimeType })], name, { type: mimeType });
};

// Renders a blank white page and returns it as a single-page PNG file. Used when the plugin
// asks to insert a blank page (content === null).
const createBlankPageFile = (): Promise<File> => new Promise((resolve, reject) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    reject(new Error('Could not get canvas context for blank page.'));
    return;
  }
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  canvas.toBlob((blob) => {
    if (!blob) {
      reject(new Error('Could not create blank page image.'));
      return;
    }
    resolve(new File([blob], 'blank-page.png', { type: 'image/png' }));
  }, 'image/png');
});

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

const isValidInsertEvent = (event: CustomEvent<InsertPagesCommandArguments>) => (
  event instanceof CustomEvent
    && event.detail != null
    && typeof event.detail.position === 'number'
);

const PluginInsertPagesPresentationServerCommandsManager = () => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    presenter: user.presenter,
  }));

  // Reuse the app's presentations subscription to resolve the current presentation (the insert target).
  const { data: presentationsData } = useDeduplicatedSubscription<{
    pres_presentation: Array<{ presentationId: string; current: boolean }>;
  }>(PRESENTATIONS_SUBSCRIPTION);
  const presentations = presentationsData?.pres_presentation ?? [];
  const currentPresentationId = presentations.find((p) => p.current)?.presentationId;

  const handleInsertPages = ((event: CustomEvent<InsertPagesCommandArguments>) => {
    if (!currentUserData?.presenter) {
      logger.warn({
        logCode: 'plugin_presentation_insert_pages_not_allowed',
      }, 'Plugin tried to insert pages but user is not a presenter');
      return;
    }
    if (!isValidInsertEvent(event)) {
      logger.error({
        logCode: 'plugin_presentation_insert_pages',
      }, 'Failed to insert pages from plugin command: malformed event detail');
      return;
    }
    if (!currentPresentationId) {
      logger.error({
        logCode: 'plugin_presentation_insert_pages',
      }, 'Insert pages: no current presentation to insert into');
      return;
    }

    const {
      position, content, mimeType, filename,
    } = event.detail;

    const filePromise = content == null
      ? createBlankPageFile()
      : toFile(content, mimeType || 'application/pdf', filename);

    filePromise
      .then((file) => insertPages(file, position, currentPresentationId))
      .catch((error) => {
        logger.error({
          logCode: 'plugin_presentation_insert_pages',
          extraInfo: { error: (error as Error)?.message },
        }, 'Failed to insert pages from plugin command');
      });
  }) as EventListener;

  useEffect(() => {
    window.addEventListener(PresentationCommandsEnum.INSERT_PAGES, handleInsertPages);
    return () => {
      window.removeEventListener(PresentationCommandsEnum.INSERT_PAGES, handleInsertPages);
    };
  }, [currentUserData, currentPresentationId]);

  return null;
};

export default PluginInsertPagesPresentationServerCommandsManager;
