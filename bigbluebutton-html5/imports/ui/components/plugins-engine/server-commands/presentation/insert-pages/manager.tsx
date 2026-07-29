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
import { PRESENTATIONS_SUBSCRIPTION } from '/imports/ui/components/whiteboard/queries';
import {
  fetchBlankPageFile,
  insertPagesUpload,
} from '/imports/ui/components/presentation/presentation-toolbar/insert-pages/service';
import { toFile } from '../content-to-file';

// The command name and argument types come from the plugin SDK, mirroring the sibling
// upload/manager.tsx. Resolving these requires the paired insertPages SDK change, which is not in a
// published release yet; bigbluebutton-html5/package.json references the SDK branch (codeload) until
// it is released, at which point that dep becomes a normal version bump.

const isValidInsertEvent = (event: CustomEvent<InsertPagesCommandArguments>) => (
  event instanceof CustomEvent
    && event.detail != null
    && Number.isInteger(event.detail.position)
    && event.detail.position >= 1
);

const PluginInsertPagesPresentationServerCommandsManager = () => {
  const uploadInFlight = useRef(false);
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
    const presentationSettings = window.meetingClientSettings.public.presentation as {
      insertPagesEnabled?: boolean;
    };
    if (!presentationSettings.insertPagesEnabled) {
      logger.warn({
        logCode: 'plugin_presentation_insert_pages_disabled',
      }, 'Plugin tried to insert pages while the feature is disabled');
      return;
    }
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
    if (uploadInFlight.current) {
      logger.warn({
        logCode: 'plugin_presentation_insert_pages_in_flight',
      }, 'Plugin tried to insert pages while an upload is in flight');
      return;
    }

    const {
      position, content, mimeType, filename,
    } = event.detail;
    uploadInFlight.current = true;

    // A null content means "insert a blank page": the same server-hosted blank.pdf the native
    // toolbar inserts, so both paths go through the regular conversion pipeline.
    const filePromise = content == null
      ? fetchBlankPageFile()
      : toFile(content, mimeType || 'application/pdf', filename);

    filePromise
      .then((file) => insertPagesUpload(file, position, currentPresentationId))
      .catch((error) => {
        logger.error({
          logCode: 'plugin_presentation_insert_pages',
          extraInfo: { error: (error as Error)?.message },
        }, 'Failed to insert pages from plugin command');
      })
      // This guard covers conversion to File and upload only. The asynchronous
      // splice can still interleave with native or later plugin inserts.
      .finally(() => {
        uploadInFlight.current = false;
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
