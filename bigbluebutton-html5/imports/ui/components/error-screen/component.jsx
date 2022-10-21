import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import AudioManager from '/imports/ui/services/audio-manager';
import logger from '/imports/startup/client/logger';
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
};

const defaultProps = {
  code: '500',
  callback: async () => {},
};

class ErrorScreen extends PureComponent {
  componentDidMount() {
    const { code, callback } = this.props;
    const log = code === '403' ? 'warn' : 'error';
    AudioManager.exitAudio();
    callback().finally(() => {
      Meteor.disconnect();
    });
    logger[log]({ logCode: 'startup_client_usercouldnotlogin_error' }, `User could not log in HTML5, hit ${code}`);
  }

  render() {
    const {
      intl,
      code,
      children,
    } = this.props;

    let formatedMessage = intl.formatMessage(intlMessages[defaultProps.code]);

    if (code in intlMessages) {
      formatedMessage = intl.formatMessage(intlMessages[code]);
    }

    let errorMessageDescription = Session.get('errorMessageDescription');

    if (errorMessageDescription in intlMessages) {
      errorMessageDescription = intl.formatMessage(intlMessages[errorMessageDescription]);
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

ErrorScreen.propTypes = propTypes;
ErrorScreen.defaultProps = defaultProps;
