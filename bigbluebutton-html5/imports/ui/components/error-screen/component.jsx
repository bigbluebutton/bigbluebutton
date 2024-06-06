import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import Styled from './styles';

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
});

const propTypes = {
  code: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  error: PropTypes.object,
  errorInfo: PropTypes.object,
};

const defaultProps = {
  code: '500',
  callback: () => {},
  endedReason: null,
  error: {},
  errorInfo: null,
};

class ErrorScreen extends PureComponent {
  componentDidMount() {
    const { code, callback, endedReason } = this.props;
    // stop audio
    document.querySelector('audio').pause();
    navigator
      .mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((m) => m.getTracks().forEach((t) => t.stop()));
    window.dispatchEvent(new Event('StopAudioTracks'));
    callback(endedReason, () => Meteor.disconnect());
    console.error({ logCode: 'startup_client_usercouldnotlogin_error' }, `User could not log in HTML5, hit ${code}`);
  }

  render() {
    const {
      intl,
      code,
      children,
      error,
      errorInfo,
    } = this.props;
    let formatedMessage = 'Oops, something went wrong';
    let errorMessageDescription = Session.get('errorMessageDescription');
    if (intl) {
      formatedMessage = intl.formatMessage(intlMessages[defaultProps.code]);

      if (code in intlMessages) {
        formatedMessage = intl.formatMessage(intlMessages[code]);
      }

      errorMessageDescription = Session.get('errorMessageDescription');

      if (errorMessageDescription in intlMessages) {
        errorMessageDescription = intl.formatMessage(intlMessages[errorMessageDescription]);
      }
    }

    if (error) {
      errorMessageDescription = error.message;
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
        {
          errorInfo
            ? (
              <textarea
                rows="5"
                cols="33"
                disabled
              >
                {JSON.stringify(errorInfo)}
              </textarea>
            )
            : null
        }
        <Styled.Separator />
        <Styled.CodeError>
          {code}
        </Styled.CodeError>
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
