import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { notify } from '/imports/ui/services/notification';
import logger from '/imports/startup/client/logger';
import Service from './service';
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
  targetPosition: number;
  afterSlide: number;
  baseline: number;
  kind: 'blank' | 'file';
  filename: string;
}

interface InsertPagesContainerProps {
  presentationId?: string;
  currentSlideNum: number;
  numberOfSlides: number;
  isConnected: boolean;
  skipToSlide: (slideNum: number) => void;
}

const InsertPagesContainer: React.FC<InsertPagesContainerProps> = ({
  presentationId,
  currentSlideNum,
  numberOfSlides,
  isConnected,
  skipToSlide,
}) => {
  const intl = useIntl();
  const [inFlight, setInFlight] = useState(false);
  const pendingRef = useRef<PendingInsert | null>(null);
  const progressToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRetryTimers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const clearTimers = useCallback(() => {
    if (progressToastTimer.current) clearTimeout(progressToastTimer.current);
    if (completionTimer.current) clearTimeout(completionTimer.current);
    navRetryTimers.current.forEach(clearTimeout);
    navRetryTimers.current = [];
    progressToastTimer.current = null;
    completionTimer.current = null;
  }, []);

  // The pages subscription that skipToSlide reads can lag the page-count bump by a few hundred
  // ms, so a single navigate right after completion may target a page that is not in the list
  // yet and no-op. Fire it immediately and retry a few times; skipToSlide is idempotent.
  const autoAdvance = useCallback((target: number) => {
    skipToSlide(target);
    [400, 1000, 1800].forEach((delay) => {
      navRetryTimers.current.push(setTimeout(() => skipToSlide(target), delay));
    });
  }, [skipToSlide]);

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

  const startInsert = useCallback((
    kind: 'blank' | 'file', filePromise: Promise<File>, filename: string,
  ) => {
    if (pendingRef.current || !presentationId) return;

    const afterSlide = currentSlideNum;
    const targetPosition = currentSlideNum + 1;
    pendingRef.current = {
      targetPosition, afterSlide, baseline: numberOfSlides, kind, filename,
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
      .then((file) => Service.insertPagesUpload(file, targetPosition, presentationId))
      .catch((error) => {
        logger.error({
          logCode: 'presentation_insert_pages',
          extraInfo: { error: (error as Error)?.message },
        }, 'Native insert pages failed');
        failInsert(filename, (error as Error)?.message ?? 'unknown error');
      });
  }, [presentationId, currentSlideNum, numberOfSlides, intl, failInsert]);

  // The upload only confirms the server accepted the file; conversion and splicing happen
  // asynchronously. We detect completion when the current presentation grows past the page
  // count captured at insert time, then auto-advance to the first inserted page.
  useEffect(() => {
    const pending = pendingRef.current;
    if (!pending || numberOfSlides <= pending.baseline) return;

    const count = numberOfSlides - pending.baseline;
    const {
      targetPosition, afterSlide, kind, filename,
    } = pending;
    resolveInsert();
    autoAdvance(Math.min(targetPosition, numberOfSlides));
    notify(
      kind === 'blank'
        ? intl.formatMessage(intlMessages.blankSlideInserted, { slide: afterSlide })
        : intl.formatMessage(intlMessages.pagesInserted, { count, filename, slide: afterSlide }),
      'success',
      'presentation',
    );
  }, [numberOfSlides, autoAdvance, intl, resolveInsert]);

  useEffect(() => clearTimers, [clearTimers]);

  const handleInsertBlank = useCallback(() => {
    startInsert('blank', Service.fetchBlankPageFile(), 'blank.pdf');
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
      acceptMimeTypes={Service.buildAcceptAttribute()}
      onInsertBlank={handleInsertBlank}
      onInsertFromFile={handleInsertFromFile}
    />
  );
};

export default InsertPagesContainer;
