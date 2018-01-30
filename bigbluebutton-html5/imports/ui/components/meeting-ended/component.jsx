import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
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
  messageEnded: {
    id: 'app.meeting.endedMessage',
    description: 'message saying to go back to home screen',
  },
  buttonOkay: {
    id: 'app.meeting.endNotification.ok.label',
    description: 'label okay for button',
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
  constructor() {
    super();

    this.handleBackAttempt = this.handleBackAttempt.bind(this);
  }

  componentDidMount() {
    window.onpopstate = this.handleBackAttempt;
  }

  handleBackAttempt() {
    const { router } = this.props;
    router.push('/logout');
  }

  render() {
    const { intl, router, code } = this.props;

    return (
      <div className={styles.parent}>
        <div className={styles.modal}>
          <div className={styles.content}>
            <h1 className={styles.title}>{intl.formatMessage(intlMessage[code])}</h1>
            <div className={styles.text}>
              {intl.formatMessage(intlMessage.messageEnded)}
            </div>
            <Button
              color="primary"
              className={styles.button}
              label={intl.formatMessage(intlMessage.buttonOkay)}
              size="sm"
              onClick={() => router.push('/logout')}
            />
          </div>
        </div>
      </div>
    );
  }
}

MeetingEnded.propTypes = propTypes;

export default injectIntl(withRouter(MeetingEnded));
