import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Auth from '/imports/ui/services/auth';
import Button from '/imports/ui/components/button/component';
import Rating from './rating/component';
import { styles } from './styles';

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
  confirmLabel: {
    id: 'app.leaveConfirmation.confirmLabel',
    description: 'Confirmation button label',
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
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  code: PropTypes.string.isRequired,
  router: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

class MeetingEnded extends React.PureComponent {
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
    this.setSelectedStar = this.setSelectedStar.bind(this);
    this.sendFeedback = this.sendFeedback.bind(this);
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

    const {
      router,
      userName,
    } = this.props;

    if (selected <= 0) {
      router.push('/logout');
      return;
    }

    const message = {
      rating: selected,
      userId: Auth.userID,
      meetingId: Auth.meetingID,
      comment: MeetingEnded.getComment(),
      userName,
    };
    const url = '/html5client/feedback';

    const options = {
      method: 'POST',
      body: JSON.stringify(message),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    fetch(url, options)
      .finally(() => router.push('/logout'));
  }

  render() {
    const { intl, code, shouldShowFeedback } = this.props;
    const noRating = this.state.selected <= 0;
    return (
      <div className={styles.parent}>
        <div className={styles.modal}>
          <div className={styles.content}>
            <h1 className={styles.title}>{intl.formatMessage(intlMessage[code])}</h1>
            <div className={styles.text}>
              {shouldShowFeedback
                ? intl.formatMessage(intlMessage.subtitle)
                : intl.formatMessage(intlMessage.messageEnded)}
            </div>
            {shouldShowFeedback ? (
              <div className={styles.rating}>
                <Rating
                  total="5"
                  onRate={this.setSelectedStar}
                />
                <textarea
                  rows="5"
                  id="feedbackComment"
                  disabled={noRating}
                  className={styles.textarea}
                  placeholder={intl.formatMessage(intlMessage.textarea)}
                  aria-describedby="textareaDesc"
                />
              </div>
            ) : null }
            <Button
              color="primary"
              onClick={this.sendFeedback}
              className={styles.button}
              label={noRating
                 ? intl.formatMessage(intlMessage.buttonOkay)
                 : intl.formatMessage(intlMessage.sendLabel)}
              description={noRating ?
                intl.formatMessage(intlMessage.confirmDesc)
                : intl.formatMessage(intlMessage.sendDesc)}
            />
          </div>
        </div>
      </div>
    );
  }
}

MeetingEnded.propTypes = propTypes;

export default injectIntl(withRouter(MeetingEnded));
