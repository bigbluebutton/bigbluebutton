import { useEffect, useRef } from 'react';
import {
  InsertPagesCommandArguments,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/server-commands/presentation/types';
import {
  PresentationCommandsEnum,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/server-commands/presentation/enum';
import logger from '/imports/startup/client/logger';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import {
  CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
  CurrentPresentationPageSubscriptionResponse,
} from '/imports/ui/components/whiteboard/queries';
import {
  insertBlankPage,
  insertPages,
  showInsertError,
} from '/imports/ui/components/presentation/presentation-toolbar/insert-pages/service';
import {
  fileNameOf,
  isPayloadTooLarge,
  toFile,
} from '/imports/ui/components/plugins-engine/server-commands/presentation/content-to-file';

const DEFAULT_MIME_TYPE = 'application/pdf';
const INT32_MIN = -2147483648;
const INT32_MAX = 2147483647;

// One chain for every plugin, kept in the module: the manager is mounted in two exclusive layout branches, and
// a remount must not start a second chain. A command prepares its file and asks for its insert once the request
// of the previous one ended; it does not wait for the upload, so uploads and conversions run in parallel.
let chain: Promise<void> = Promise.resolve();

const enqueue = (step: () => Promise<void>) => {
  chain = chain.then(step).catch((error) => {
    logger.error({
      logCode: 'plugin_presentation_insert_pages_failed',
      extraInfo: { error },
    }, 'Failed to insert pages from plugin command');
  });
};

// The name of the file in the warning: the name the preparation gives it.
const warningFileName = (detail: InsertPagesCommandArguments, mimeType: string): string => {
  try {
    return fileNameOf(detail.content!, mimeType, detail.filename);
  } catch {
    return detail.filename || `Plugin_Presentation.${mimeType.split('/')[1] || 'pdf'}`;
  }
};

const PluginInsertPagesServerCommandsManager = () => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    presenter: user.presenter,
  }));
  const { data: presentationPageData } = useDeduplicatedSubscription<CurrentPresentationPageSubscriptionResponse>(
    CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
  );

  // Read by the listener at the moment of the command, not when it was registered.
  const presenterRef = useRef(false);
  presenterRef.current = !!currentUserData?.presenter;
  const currentPageRef = useRef<{ presentationId: string; totalPages: number } | undefined>(undefined);
  currentPageRef.current = presentationPageData?.pres_page_curr?.[0];

  useEffect(() => {
    const handleInsertPages = ((event: CustomEvent<InsertPagesCommandArguments>) => {
      if (!presenterRef.current) {
        logger.warn({
          logCode: 'plugin_presentation_insert_pages_not_allowed',
        }, 'Plugin tried to insert pages but user is not a presenter');
        return;
      }
      const detail = event?.detail;
      const position = detail?.position;
      if (!Number.isInteger(position) || position < INT32_MIN || position > INT32_MAX) {
        logger.error({
          logCode: 'plugin_presentation_insert_pages_invalid_position',
          extraInfo: { position },
        }, 'Plugin tried to insert pages at a position that is not an integer');
        return;
      }
      const currentPage = currentPageRef.current;
      if (!currentPage) {
        logger.warn({
          logCode: 'plugin_presentation_insert_pages_no_presentation',
        }, 'Plugin tried to insert pages but there is no current presentation');
        return;
      }
      // The server places the pages, and follows the position if the order changed since totalPages was read.
      const { presentationId, totalPages } = currentPage;

      if (detail.content == null) {
        enqueue(() => insertBlankPage(presentationId, position, totalPages, false).requested);
        return;
      }

      const mimeType = typeof detail.mimeType === 'string' ? detail.mimeType : DEFAULT_MIME_TYPE;
      enqueue(async () => {
        let file: File;
        try {
          file = await toFile(detail.content!, mimeType, detail.filename);
        } catch (error) {
          logger.error({
            logCode: 'plugin_presentation_insert_pages_file',
            extraInfo: { error },
          }, 'Failed to prepare the file of a plugin command to insert pages');
          showInsertError(warningFileName(detail, mimeType), isPayloadTooLarge(error));
          return;
        }
        await insertPages(presentationId, file, position, totalPages, false).requested;
      });
    }) as EventListener;

    window.addEventListener(PresentationCommandsEnum.INSERT_PAGES, handleInsertPages);
    return () => {
      window.removeEventListener(PresentationCommandsEnum.INSERT_PAGES, handleInsertPages);
    };
  }, []);

  return null;
};

export default PluginInsertPagesServerCommandsManager;
