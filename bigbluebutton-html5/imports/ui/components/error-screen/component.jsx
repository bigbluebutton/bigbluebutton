import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Session from '/imports/ui/services/storage/in-memory';
import Styled from './styles';
import intlHolder from '../../core/singletons/intlHolder';

const intlMessages = defineMessages({
  503: {
    id: 'app.error.503',
  },
  500: {
    id: 'app.error.500',
    defaultMessage: 'Oops, something went wrong',
  },
  410: {
    id: 'app.error.410',
  },
  409: {
    id: 'app.error.409',
  },
  408: {
    id: 'app.error.408',
  },
  404: {
    id: 'app.error.404',
    defaultMessage: 'Not found',
  },
  403: {
    id: 'app.error.403',
  },
  401: {
    id: 'app.error.401',
  },
  400: {
    id: 'app.error.400',
  },
  meeting_ended: {
    id: 'app.meeting.endedMessage',
  },
  user_logged_out_reason: {
    id: 'app.error.userLoggedOut',
  },
  validate_token_failed_eject_reason: {
    id: 'app.error.ejectedUser',
  },
  banned_user_rejoining_reason: {
    id: 'app.error.userBanned',
  },
  joined_another_window_reason: {
    id: 'app.error.joinedAnotherWindow',
  },
  user_inactivity_eject_reason: {
    id: 'app.meeting.logout.userInactivityEjectReason',
  },
  user_requested_eject_reason: {
    id: 'app.meeting.logout.ejectedFromMeeting',
  },
  max_participants_reason: {
    id: 'app.meeting.logout.maxParticipantsReached',
  },
  guest_deny: {
    id: 'app.guest.guestDeny',
  },
  duplicate_user_in_meeting_eject_reason: {
    id: 'app.meeting.logout.duplicateUserEjectReason',
  },
  not_enough_permission_eject_reason: {
    id: 'app.meeting.logout.permissionEjectReason',
  },
  able_to_rejoin_user_disconnected_reason: {
    id: 'app.error.disconnected.rejoin',
  },
  user_not_found: {
    id: 'app.error.userNotFound',
  },
  request_timeout: {
    id: 'app.error.requestTimeout',
  },
  meeting_not_found: {
    id: 'app.error.meetingNotFound',
  },
  session_token_replaced: {
    id: 'app.error.sessionTokenReplaced',
  },
  internal_error: {
    id: 'app.error.serverInternalError',
  },
  param_missing: {
    id: 'app.error.paramMissing',
  },
  too_many_connections: {
    id: 'app.error.tooManyConnections',
  },
  server_closed: {
    id: 'app.error.serverClosed',
  },
});

const propTypes = {
  error: PropTypes.object,
};

const defaultProps = {
  callback: () => {},
  endedReason: null,
  error: {},
};

class ErrorScreen extends PureComponent {
  componentDidMount() {
    const { callback, endedReason } = this.props;
    // stop audio
    callback(endedReason, () => {});
  }

  render() {
    const {
      children,
      error,
    } = this.props;
    const formatedMessage = 'Oops, something went wrong';
    let errorMessageDescription = Session.getItem('errorMessageDescription');
    const intl = intlHolder.getIntl();

    if (error) {
      errorMessageDescription = error.message;
    }

    if (intl) {
      errorMessageDescription = Session.getItem('errorMessageDescription');

      if (errorMessageDescription in intlMessages) {
        errorMessageDescription = intl.formatMessage(intlMessages[errorMessageDescription]);
      }
    }

    return (
      <Styled.Background>
        <Styled.Message data-test="errorScreenMessage">
          {formatedMessage}
        </Styled.Message>
        {
          !errorMessageDescription
          || formatedMessage === errorMessageDescription
          || (
            <Styled.SessionMessage>
              {errorMessageDescription}
            </Styled.SessionMessage>
          )
        }
        <div>
          {children}
        </div>
      </Styled.Background>
    );
  }
}

export default injectIntl(ErrorScreen);

export { ErrorScreen };

ErrorScreen.propTypes = propTypes;
ErrorScreen.defaultProps = defaultProps;
