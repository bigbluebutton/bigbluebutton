import React from 'react';
import { FormattedMessage } from 'react-intl';
import { v4 as uuid } from 'uuid';
import Auth from '/imports/ui/services/auth';
import logger from '/imports/startup/client/logger';
import { notify } from '/imports/ui/services/notification';
import apolloContextHolder from '/imports/ui/core/graphql/apolloContextHolder/apolloContextHolder';
import getSizeWithUnit from '/imports/utils/getSizeWithUnit';
import PresentationUploadService from '/imports/ui/components/actions-bar/media-area/media-sharing/presentation/service';
import { PRESENTATION_INSERT_BLANK_PAGE } from '/imports/ui/components/presentation/mutations';

// The name of a blank page in the warnings, as the server names it in its notifications.
export const BLANK_PAGE_FILENAME = 'blank.pdf';

// requested ends when the request ended (accepted, refused or timed out); done when the upload of the file
// ended, never before requested. Neither rejects. The outcome of the insert comes as a server notification.
export interface InsertRequest {
  requested: Promise<void>;
  done: Promise<void>;
}

interface UploadState {
  error?: boolean;
  reported?: boolean;
}

const presentationConfig = () => window.meetingClientSettings.public.presentation;

// The warning of an insert that failed before the server could report it: the file was too large to send,
// or the request or the upload failed on the way.
export const showInsertError = (filename: string, tooLarge = false): void => {
  if (tooLarge) {
    const maxFileSize = getSizeWithUnit(presentationConfig().mirroredFromBBBCore.uploadSizeMax);
    notify(
      React.createElement(
        React.Fragment,
        null,
        `${filename}: `,
        React.createElement(FormattedMessage, { id: 'app.presentationUploder.upload.413', values: { maxFileSize } }),
      ),
      'error',
    );
    return;
  }
  notify(
    React.createElement(FormattedMessage, { id: 'app.presentation.insertPages.error.failed', values: { filename } }),
    'error',
  );
};

// Asks the server for a blank page at position, the size of the page before it. seenTotalPages is the
// totalPages read together with position.
export const insertBlankPage = (
  presentationId: string,
  position: number,
  seenTotalPages: number,
  navigate: boolean,
): InsertRequest => {
  const requested = new Promise<void>((resolve) => {
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const settle = (failed: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (failed) showInsertError(BLANK_PAGE_FILENAME);
      resolve();
    };
    // An answer that arrives after this is ignored: the warning was already shown.
    timer = setTimeout(() => {
      logger.warn({ logCode: 'presentation_insert_blank_page_timeout', extraInfo: { presentationId } },
        'The request for a blank page got no answer in time');
      settle(true);
    }, PresentationUploadService.TOKEN_TIMEOUT);
    apolloContextHolder.getClient().mutate({
      mutation: PRESENTATION_INSERT_BLANK_PAGE,
      variables: {
        presentationId, position, seenTotalPages, navigate,
      },
    }).then(() => settle(false), (error: unknown) => {
      logger.error({ logCode: 'presentation_insert_blank_page_error', extraInfo: { presentationId, error } },
        'The request for a blank page failed');
      settle(true);
    });
  });
  return { requested, done: requested };
};

// Inserts the pages of file at position, with the upload token and the upload of any presentation.
export const insertPages = (
  presentationId: string,
  file: File,
  position: number,
  seenTotalPages: number,
  navigate: boolean,
): InsertRequest => {
  if (file.size > presentationConfig().mirroredFromBBBCore.uploadSizeMax) {
    showInsertError(file.name, true);
    const ended = Promise.resolve();
    return { requested: ended, done: ended };
  }

  let markRequested: () => void = () => {};
  const requested = new Promise<void>((resolve) => { markRequested = resolve; });
  const intent = {
    insertIntoPresentationId: presentationId,
    insertAtPosition: position,
    insertSeenTotalPages: seenTotalPages,
    insertNavigate: navigate,
  };
  const done = PresentationUploadService.uploadAndConvertPresentation(
    file.name,
    uuid(),
    file,
    false,
    Auth.meetingID,
    presentationConfig().uploadEndpoint,
    // A refusal the server recorded is shown by the server; anything else is shown here.
    (upload: UploadState) => { if (upload.error && !upload.reported) showInsertError(file.name); },
    () => {},
    () => {},
    false,
    intent,
    () => markRequested(),
  ).then(() => markRequested(), () => markRequested());
  return { requested, done };
};
