import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { v4 as uuid } from 'uuid';
import { notify } from '/imports/ui/services/notification';
import logger from '/imports/startup/client/logger';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import {
  getNotificationsStream,
  NotificationResponse,
} from '/imports/ui/components/notifications/queries';
import { uniqueId } from '/imports/utils/string-utils';
import {
  buildAcceptAttribute,
  fetchBlankPageFile,
  insertPagesUpload,
} from './service';
import InsertPagesToolbarButton from './component';

const INSERT_TIMEOUT_MS = 120_000;
const PROGRESS_TOAST_DELAY_MS = 800;

const intlMessages = defineMessages({
  insertPagesLabel: {
    id: 'app.presentation.presentationToolbar.insertPagesLabel',
    description: 'Insert pages button label',
  },
  insertPagesUnavailable: {
    id: 'app.presentation.presentationToolbar.insertPagesUnavailable',
    description: 'Tooltip when the insert pages button is unavailable',
  },
  insertingBlankSlide: {
    id: 'app.presentation.presentationToolbar.insertingBlankSlide',
    description: 'In-progress toast while a blank slide is inserted',
  },
  convertingFile: {
    id: 'app.presentation.presentationToolbar.convertingFile',
    description: 'In-progress toast while a file is converted and inserted',
  },
  blankSlideInserted: {
    id: 'app.presentation.presentationToolbar.blankSlideInserted',
    description: 'Success toast after a blank slide is inserted',
  },
  pagesInserted: {
    id: 'app.presentation.presentationToolbar.pagesInserted',
    description: 'Success toast after file pages are inserted',
  },
  insertPagesError: {
    id: 'app.presentation.presentationToolbar.insertPagesError',
    description: 'Error toast when an insert fails',
  },
  insertPagesTimeoutReason: {
    id: 'app.presentation.presentationToolbar.insertPagesTimeoutReason',
    description: 'Reason shown when an insert never completes',
  },
});

interface PendingInsert {
  presentationId: string;
  targetPosition: number;
  afterSlide: number;
  requestId: string;
  kind: 'blank' | 'file';
  filename: string;
}

interface InsertPagesContainerProps {
  presentationId?: string;
  currentSlideNum: number;
  numberOfSlides: number;
  pages: Array<{ pageId: string; insertRequestId?: string }>;
  isConnected: boolean;
  skipToSlide: (slideNum: number) => void;
}

const InsertPagesContainer: React.FC<InsertPagesContainerProps> = ({
  presentationId,
  currentSlideNum,
  numberOfSlides,
  pages,
  isConnected,
  skipToSlide,
}) => {
  const intl = useIntl();
  const [inFlight, setInFlight] = useState(false);
  const pendingRef = useRef<PendingInsert | null>(null);
  const lastSeenNotificationAtRef = useRef(0);
  const progressToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: notificationsStream } = useDeduplicatedSubscription<NotificationResponse>(
    getNotificationsStream,
    { variables: { initialCursor: '2000-01-01' } },
  );

  const clearTimers = useCallback(() => {
    if (progressToastTimer.current) clearTimeout(progressToastTimer.current);
    if (completionTimer.current) clearTimeout(completionTimer.current);
    progressToastTimer.current = null;
    completionTimer.current = null;
  }, []);

  const resolveInsert = useCallback(() => {
    pendingRef.current = null;
    clearTimers();
    setInFlight(false);
  }, [clearTimers]);

  const failInsert = useCallback((filename: string, reason: string) => {
    if (!pendingRef.current) return;
    resolveInsert();
    notify(
      intl.formatMessage(intlMessages.insertPagesError, { filename, reason }),
      'error',
      'warning',
    );
  }, [intl, resolveInsert]);

  // The failure notification is broadcast to the whole meeting, so it can just as well
  // announce another presenter's failed insert. Only the one carrying this request's
  // correlation id resolves the insert pending here.
  useEffect(() => {
    const pendingRequestId = pendingRef.current?.requestId;
    let thisInsertFailed = false;
    notificationsStream?.notification_stream.forEach((notification) => {
      const createdAt = new Date(notification.createdAt).getTime();
      if (createdAt <= lastSeenNotificationAtRef.current) return;
      lastSeenNotificationAtRef.current = createdAt;
      if (notification.messageId === 'app.presentation.insertPagesFailedNotification'
        && pendingRequestId !== undefined
        && notification.messageValues?.insertRequestId === pendingRequestId) {
        thisInsertFailed = true;
      }
    });
    if (thisInsertFailed) resolveInsert();
  }, [notificationsStream, resolveInsert]);

  const startInsert = useCallback((
    kind: 'blank' | 'file', filePromise: Promise<File>, filename: string,
  ) => {
    if (pendingRef.current || !presentationId) return;

    const afterSlide = currentSlideNum;
    const targetPosition = currentSlideNum + 1;
    const requestId = uniqueId(uuid());
    pendingRef.current = {
      presentationId, targetPosition, afterSlide, requestId, kind, filename,
    };
    setInFlight(true);

    // Only surface the in-progress toast once the operation actually takes a moment,
    // so quick inserts do not flash a toast.
    progressToastTimer.current = setTimeout(() => {
      notify(
        kind === 'blank'
          ? intl.formatMessage(intlMessages.insertingBlankSlide)
          : intl.formatMessage(intlMessages.convertingFile, { filename }),
        'info',
        'presentation',
      );
    }, PROGRESS_TOAST_DELAY_MS);

    completionTimer.current = setTimeout(() => {
      failInsert(filename, intl.formatMessage(intlMessages.insertPagesTimeoutReason));
    }, INSERT_TIMEOUT_MS);

    filePromise
      .then((file) => insertPagesUpload(file, targetPosition, presentationId, requestId))
      .catch((error) => {
        logger.error({
          logCode: 'presentation_insert_pages',
          extraInfo: { error: (error as Error)?.message },
        }, 'Native insert pages failed');
        failInsert(filename, (error as Error)?.message ?? 'unknown error');
      });
  }, [presentationId, currentSlideNum, intl, failInsert]);

  // The upload only confirms the server accepted the file; conversion and splicing happen
  // asynchronously. We detect completion when pages carrying this request's correlation id
  // appear in the target presentation, then auto-advance to the first inserted page.
  useEffect(() => {
    const pending = pendingRef.current;
    if (!pending) return;

    // If the presenter switches presentations mid-insert, the optimistic state
    // is dropped silently: the insert may still land on the original presentation, but its
    // completion is no longer observable from here, so neither success nor failure could
    // be reported honestly.
    if (presentationId !== pending.presentationId) {
      logger.info({
        logCode: 'presentation_insert_pages',
        extraInfo: { pendingPresentationId: pending.presentationId, presentationId },
      }, 'Presentation switched mid-insert; dropping insert tracking');
      resolveInsert();
      return;
    }
    const insertedPages = pages.filter((page) => page.insertRequestId === pending.requestId);
    if (insertedPages.length === 0) return;

    const count = insertedPages.length;
    const {
      targetPosition, afterSlide, kind, filename,
    } = pending;
    resolveInsert();
    skipToSlide(Math.min(targetPosition, numberOfSlides));
    notify(
      kind === 'blank'
        ? intl.formatMessage(intlMessages.blankSlideInserted, { slide: afterSlide })
        : intl.formatMessage(intlMessages.pagesInserted, { count, filename, slide: afterSlide }),
      'success',
      'presentation',
    );
  }, [presentationId, numberOfSlides, pages, skipToSlide, intl, resolveInsert]);

  useEffect(() => clearTimers, [clearTimers]);

  const handleInsertBlank = useCallback(() => {
    startInsert('blank', fetchBlankPageFile(), 'blank.pdf');
  }, [startInsert]);

  const handleInsertFromFile = useCallback((file: File) => {
    startInsert('file', Promise.resolve(file), file.name);
  }, [startInsert]);

  const hasPresentation = Boolean(presentationId) && numberOfSlides > 0;
  const disabled = !isConnected || !hasPresentation;
  const tooltipLabel = disabled
    ? intl.formatMessage(intlMessages.insertPagesUnavailable)
    : intl.formatMessage(intlMessages.insertPagesLabel);

  return (
    <InsertPagesToolbarButton
      disabled={disabled}
      inFlight={inFlight}
      tooltipLabel={tooltipLabel}
      acceptMimeTypes={buildAcceptAttribute()}
      onInsertBlank={handleInsertBlank}
      onInsertFromFile={handleInsertFromFile}
    />
  );
};

export default InsertPagesContainer;
