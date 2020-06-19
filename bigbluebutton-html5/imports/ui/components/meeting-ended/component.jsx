import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { Meteor } from 'meteor/meteor';
import Auth from '/imports/ui/services/auth';
import Button from '/imports/ui/components/button/component';
import getFromUserSettings from '/imports/ui/services/users-settings';
import logoutRouteHandler from '/imports/utils/logoutRouteHandler';
import Rating from './rating/component';
import { styles } from './styles';
import logger from '/imports/startup/client/logger';
import Users from '/imports/api/users';
import AudioManager from '/imports/ui/services/audio-manager';

const intlMessage = defineMessages({
  410: {
    id: 'app.meeting.ended',
    description: 'message when meeting is ended',
  },
  403: {
    id: 'app.error.removed',
    description: 'Message to display when user is removed from the conference',
  },
  430: {
    id: 'app.error.meeting.ended',
    description: 'user logged conference',
  },
  'acl-not-allowed': {
    id: 'app.error.removed',
    description: 'Message to display when user is removed from the conference',
  },
  messageEnded: {
    id: 'app.meeting.endedMessage',
    description: 'message saying to go back to home screen',
  },
  buttonOkay: {
    id: 'app.meeting.endNotification.ok.label',
    description: 'label okay for button',
  },
  title: {
    id: 'app.feedback.title',
    description: 'title for feedback screen',
  },
  subtitle: {
    id: 'app.feedback.subtitle',
    description: 'subtitle for feedback screen',
  },
  textarea: {
    id: 'app.feedback.textarea',
    description: 'placeholder for textarea',
  },
  confirmDesc: {
    id: 'app.leaveConfirmation.confirmDesc',
    description: 'adds context to confim option',
  },
  sendLabel: {
    id: 'app.feedback.sendFeedback',
    description: 'send feedback button label',
  },
  sendDesc: {
    id: 'app.feedback.sendFeedbackDesc',
    description: 'adds context to send feedback option',
  },
  duplicate_user_in_meeting_eject_reason: {
    id: 'app.meeting.logout.duplicateUserEjectReason',
    description: 'message for duplicate users',
  },
  not_enough_permission_eject_reason: {
    id: 'app.meeting.logout.permissionEjectReason',
    description: 'message for whom was kicked by doing something without permission',
  },
  user_requested_eject_reason: {
    id: 'app.meeting.logout.ejectedFromMeeting',
    description: 'message when the user is removed by someone',
  },
  validate_token_failed_eject_reason: {
    id: 'app.meeting.logout.validateTokenFailedEjectReason',
    description: 'invalid auth token',
  },
  user_inactivity_eject_reason: {
    id: 'app.meeting.logout.userInactivityEjectReason',
    description: 'message for whom was kicked by inactivity',
  },
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  code: PropTypes.string.isRequired,
};

class MeetingEnded extends PureComponent {
  static getComment() {
    const textarea = document.getElementById('feedbackComment');
    const comment = textarea.value;
    return comment;
  }

  constructor(props) {
    super(props);
    this.state = {
      selected: 0,
    };

    const user = Users.findOne({ userId: Auth.userID });
    if (user) {
      this.localUserRole = user.role;
    }

    this.setSelectedStar = this.setSelectedStar.bind(this);
    this.sendFeedback = this.sendFeedback.bind(this);
    this.shouldShowFeedback = getFromUserSettings('bbb_ask_for_feedback_on_logout', Meteor.settings.public.app.askForFeedbackOnLogout);

    AudioManager.exitAudio();
    Meteor.disconnect();
  }

  setSelectedStar(starNumber) {
    this.setState({
      selected: starNumber,
    });
  }

  sendFeedback() {
    const {
      selected,
    } = this.state;

    if (selected <= 0) {
      logoutRouteHandler();
      return;
    }

    const { fullname } = Auth.credentials;

    const message = {
      rating: selected,
      userId: Auth.userID,
      userName: fullname,
      authToken: Auth.token,
      meetingId: Auth.meetingID,
      comment: MeetingEnded.getComment(),
      userRole: this.localUserRole,
    };
    const url = '/html5client/feedback';
    const options = {
      method: 'POST',
      body: JSON.stringify(message),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // client logger
    logger.info({ logCode: 'feedback_functionality', extraInfo: { feedback: message } }, 'Feedback component');

    const FEEDBACK_WAIT_TIME = 500;
    setTimeout(() => {
      fetch(url, options)
        .then(() => {
          logoutRouteHandler();
        })
        .catch(() => {
          logoutRouteHandler();
        });
    }, FEEDBACK_WAIT_TIME);
  }

  render() {
    const { intl, code } = this.props;
    const {
      selected,
    } = this.state;

    const noRating = selected <= 0;

    logger.info({ logCode: 'meeting_ended_code', extraInfo: { endedCode: code } }, 'Meeting ended component');

    return (
      <div className={styles.parent}>
        <div className={styles.modal}>
          <div className={styles.content}>
            <h1 className={styles.title} data-test="meetingEndedModalTitle">
              {
                intl.formatMessage(intlMessage[code] || intlMessage[430])
              }
            </h1>
            <div className={styles.text}>
              {this.shouldShowFeedback
                ? intl.formatMessage(intlMessage.subtitle)
                : intl.formatMessage(intlMessage.messageEnded)}
            </div>
            {this.shouldShowFeedback ? (
              <div>
                <Rating
                  total="5"
                  onRate={this.setSelectedStar}
                />
                {!noRating ? (
                  <textarea
                    rows="5"
                    id="feedbackComment"
                    className={styles.textarea}
                    placeholder={intl.formatMessage(intlMessage.textarea)}
                    aria-describedby="textareaDesc"
                  />
                ) : null}
              </div>
            ) : null }
            <Button
              color="primary"
              onClick={this.sendFeedback}
              className={styles.button}
              label={noRating
                ? intl.formatMessage(intlMessage.buttonOkay)
                : intl.formatMessage(intlMessage.sendLabel)}
              description={noRating
                ? intl.formatMessage(intlMessage.confirmDesc)
                : intl.formatMessage(intlMessage.sendDesc)}
            />
          </div>
        </div>
      </div>
    );
  }
}

MeetingEnded.propTypes = propTypes;

export default injectIntl(MeetingEnded);
