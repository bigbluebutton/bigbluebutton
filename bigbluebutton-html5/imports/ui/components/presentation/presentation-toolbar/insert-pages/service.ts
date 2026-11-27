import React from 'react';
import { FormattedMessage } from 'react-intl';
import { v4 as uuid } from 'uuid';
import type { ApolloError } from '@apollo/client';
import Auth from '/imports/ui/services/auth';
import logger from '/imports/startup/client/logger';
import { notify } from '/imports/ui/services/notification';
import { uniqueId } from '/imports/utils/string-utils';
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

// What the upload service tells of an upload that failed (media-sharing/presentation/service.js).
interface UploadState {
  error?: boolean;
  // the server recorded the refusal of the token request and shows it
  reported?: boolean;
  // the HTTP status of the answer; 408 when the token request got no answer, none when the upload got no answer
  status?: number;
  // bbb-web answered the upload with an error other than 413 and 504
  uploadRequestFailed?: boolean;
}

// How a request ended for the presenter: done, failed for sure, or ended without knowing whether the server
// got it (the server then reports the outcome, if it got it).
type RequestOutcome = 'done' | 'failed' | 'notConfirmed';

const presentationConfig = () => window.meetingClientSettings.public.presentation;

// Each warning gets a toast of its own: without an id, notify derives one from the message, and a warning
// replaces the toast of the previous one (two failed files show only the last name).
const ownToast = () => ({ toastId: uniqueId('insert-pages-outcome-') });

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
      undefined,
      ownToast(),
    );
    return;
  }
  notify(
    React.createElement(FormattedMessage, { id: 'app.presentation.insertPages.error.failed', values: { filename } }),
    'error',
    undefined,
    ownToast(),
  );
};

// The warning of an insert that the client could not confirm: the request or the upload got no answer, so the
// server may still apply the insert, and then notifies it.
export const showInsertNotConfirmed = (filename: string): void => {
  notify(
    React.createElement(FormattedMessage, {
      id: 'app.presentation.insertPages.error.notConfirmed',
      values: { filename },
    }),
    'error',
    undefined,
    ownToast(),
  );
};

// The warning of an upload that failed, unless the server reports the failure itself.
const warnOfUpload = (filename: string, upload: UploadState) => {
  if (!upload.error || upload.reported) return;
  // the file was not taken: the token request got no answer, or bbb-web refused the upload
  if (upload.uploadRequestFailed || upload.status === 408) {
    showInsertError(filename);
    return;
  }
  // bbb-web refused the upload for its size and notified the failure itself
  if (upload.status === 413) return;
  // no answer, or a gateway timeout: bbb-web may still have the file
  showInsertNotConfirmed(filename);
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
    const settle = (outcome: RequestOutcome) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (outcome === 'failed') showInsertError(BLANK_PAGE_FILENAME);
      if (outcome === 'notConfirmed') showInsertNotConfirmed(BLANK_PAGE_FILENAME);
      resolve();
    };
    // An answer that arrives after this is ignored: the warning was already shown.
    timer = setTimeout(() => {
      logger.warn({ logCode: 'presentation_insert_blank_page_timeout', extraInfo: { presentationId } },
        'The request for a blank page got no answer in time');
      settle('notConfirmed');
    }, PresentationUploadService.TOKEN_TIMEOUT);
    apolloContextHolder.getClient().mutate({
      mutation: PRESENTATION_INSERT_BLANK_PAGE,
      variables: {
        presentationId, position, seenTotalPages, navigate,
      },
    }).then(() => settle('done'), (error: unknown) => {
      logger.error({ logCode: 'presentation_insert_blank_page_error', extraInfo: { presentationId, error } },
        'The request for a blank page failed');
      // An error answered by GraphQL refused the request before it reached the server; any other error (the
      // connection dropped) leaves it unknown.
      settle((error as ApolloError)?.graphQLErrors?.length ? 'failed' : 'notConfirmed');
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
    (upload: UploadState) => warnOfUpload(file.name, upload),
    () => {},
    () => {},
    false,
    intent,
    () => markRequested(),
  ).then(() => markRequested(), () => markRequested());
  return { requested, done };
};
