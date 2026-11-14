import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Session from '/imports/ui/services/storage/in-memory';
import Styled from './styles';
import intlHolder from '../../core/singletons/intlHolder';
import fetchStandaloneLocale from './standalone-locale';

const intlMessages = defineMessages({
  503: {
    id: 'app.error.503',
    description: 'error screen headline: the connection dropped',
  },
  500: {
    id: 'app.error.500',
    description: 'error screen headline: unexpected failure',
  },
  410: {
    id: 'app.error.410',
    description: 'error screen headline: the session no longer exists',
  },
  409: {
    id: 'app.error.409',
    description: 'error screen headline: conflicting request',
  },
  408: {
    id: 'app.error.408',
    description: 'error screen headline: authentication failed',
  },
  404: {
    id: 'app.error.404',
    description: 'error screen headline: not found',
  },
  403: {
    id: 'app.error.403',
    description: 'error screen headline: the user was removed',
  },
  401: {
    id: 'app.error.401',
    description: 'error screen headline: not authorized',
  },
  400: {
    id: 'app.error.400',
    description: 'error screen headline: malformed request',
  },
  meeting_ended: {
    id: 'app.error.sessionEnded',
    description: 'error screen text: the link points to a session that has ended',
  },
  user_logged_out_reason: {
    id: 'app.error.userLoggedOut',
    description: 'error screen text: the session token was invalidated by a log out',
  },
  validate_token_failed_eject_reason: {
    id: 'app.error.ejectedUser',
    description: 'error screen text: the session token was invalidated by an ejection',
  },
  banned_user_rejoining_reason: {
    id: 'app.error.userBanned',
    description: 'error screen text: the user was banned from the session',
  },
  joined_another_window_reason: {
    id: 'app.error.joinedAnotherWindow',
    description: 'error screen text: the session is open in another browser window',
  },
  user_inactivity_eject_reason: {
    id: 'app.meeting.logout.userInactivityEjectReason',
    description: 'error screen text: ejected for inactivity',
  },
  user_requested_eject_reason: {
    id: 'app.meeting.logout.ejectedFromMeeting',
    description: 'error screen text: ejected by a moderator',
  },
  max_participants_reason: {
    id: 'app.meeting.logout.maxParticipantsReached',
    description: 'error screen text: the session is full',
  },
  guest_deny: {
    id: 'app.guest.guestDeny',
    description: 'error screen text: the guest was denied entry',
  },
  duplicate_user_in_meeting_eject_reason: {
    id: 'app.meeting.logout.duplicateUserEjectReason',
    description: 'error screen text: ejected as a duplicate user',
  },
  not_enough_permission_eject_reason: {
    id: 'app.meeting.logout.permissionEjectReason',
    description: 'error screen text: ejected for a permission violation',
  },
  able_to_rejoin_user_disconnected_reason: {
    id: 'app.error.disconnected.rejoin',
    description: 'error screen text: the page can be reloaded to try again',
  },
  user_not_found: {
    id: 'app.error.userNotFound',
    description: 'error screen text: the user was not found',
  },
  request_timeout: {
    id: 'app.error.requestTimeout',
    description: 'error screen text: the request timed out',
  },
  meeting_not_found: {
    id: 'app.error.meetingNotFound',
    description: 'error screen text: the meeting was not found',
  },
  session_token_replaced: {
    id: 'app.error.sessionTokenReplaced',
    description: 'error screen text: a newer session token replaced this one',
  },
  internal_error: {
    id: 'app.error.serverInternalError',
    description: 'error screen text: server side error',
  },
  param_missing: {
    id: 'app.error.paramMissing',
    description: 'error screen text: a required parameter is missing from the link',
  },
  too_many_connections: {
    id: 'app.error.tooManyConnections',
    description: 'error screen text: too many connections',
  },
  server_closed: {
    id: 'app.error.serverClosed',
    description: 'error screen text: the server closed the connection',
  },
});

const propTypes = {
  children: PropTypes.node,
  code: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  error: PropTypes.shape({ message: PropTypes.string }),
  callback: PropTypes.func,
  endedReason: PropTypes.string,
  // Only present for the injectIntl default export.
  intl: PropTypes.shape({ formatMessage: PropTypes.func.isRequired }),
};

const GENERIC_CODE = '500';
// Bounds the wait for the locale files so the screen always resolves to something.
const LOCALE_FETCH_TIMEOUT = 10000;
// The locale files are this screen's only source of strings, so when even those are out of reach -
// the very failure intlLoader reports - one hardcoded sentence is what is left.
const UNTRANSLATED_MESSAGE = 'Something went wrong';

const ErrorScreen = ({
  children,
  code = GENERIC_CODE,
  error,
  callback = () => {},
  endedReason,
  // Set by the injectIntl default export. intlHolder only fills in once IntlAdapter mounts deep in
  // the app, so it is the fallback here, not the source of truth.
  intl: injectedIntl,
}) => {
  const intl = injectedIntl || intlHolder.getIntl();
  const [standaloneMessages, setStandaloneMessages] = useState(null);

  useEffect(() => {
    // stop audio
    callback(endedReason, () => {});
  }, []);

  useEffect(() => {
    if (intl) return undefined;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), LOCALE_FETCH_TIMEOUT);

    fetchStandaloneLocale(controller.signal)
      .then(setStandaloneMessages)
      .finally(() => clearTimeout(timeout));

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [intl]);

  const translate = (descriptor) => (
    intl ? intl.formatMessage(descriptor) : standaloneMessages[descriptor.id]
  );

  // Own-property only: the stored reason is looked up here, so 'constructor' & co must not match.
  const hasMessage = (key) => Object.prototype.hasOwnProperty.call(intlMessages, key);
  const messageFor = (key) => (hasMessage(key) ? translate(intlMessages[key]) : null);

  // Nothing is said until we know which language to say it in: flashing the wrong message before
  // the right one is worse than a beat of nothing on a screen that is already terminal.
  const ready = Boolean(intl || standaloneMessages);

  const message = ready
    ? (messageFor(code) || messageFor(GENERIC_CODE) || UNTRANSLATED_MESSAGE)
    : null;

  // What the failing code chose to surface; `error.message` is the raw throw, a last resort.
  const reason = Session.getItem('errorMessageDescription') || error?.message;
  // A known reason resolves through the catalog or not at all - the key is an internal name and
  // must never reach the user. Anything else is already human-readable (the error boundary
  // forwards an error's `cause` verbatim), as long as it is a string: a non-string child throws.
  let description = null;

  if (ready && typeof reason === 'string') {
    description = hasMessage(reason) ? messageFor(reason) : reason;
  }

  // The region is painted from mount and filled once `ready`: an alert inserted together with its
  // text is not reliably announced, whereas a change inside a region already present is.
  return (
    <Styled.Background role="alert">
      {ready && (
        <>
          <Styled.Message data-test="errorScreenMessage">
            {message}
          </Styled.Message>
          {
            !description
            || message === description
            || (
              <Styled.SessionMessage data-test="errorScreenDescription">
                {description}
              </Styled.SessionMessage>
            )
          }
          <Styled.Separator />
          <Styled.CodeError data-test="errorScreenCode">
            {code}
          </Styled.CodeError>
          <div>
            {children}
          </div>
        </>
      )}
    </Styled.Background>
  );
};

ErrorScreen.propTypes = propTypes;

export default injectIntl(ErrorScreen);

export { ErrorScreen };
