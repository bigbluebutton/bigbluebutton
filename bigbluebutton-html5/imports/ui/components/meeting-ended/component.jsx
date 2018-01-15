import React from 'react';
import { withRouter } from 'react-router';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import styles from './styles.scss';

const intlMessage = defineMessages({
  410: {
    id: 'app.meeting.ended',
    description: 'message when meeting is ended',
  },
  403: {
    id: 'app.error.kicked',
    description: 'message when user is kicked',
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

const MeetingEnded = ({ intl, router, code }) => (
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

export default injectIntl(withRouter(MeetingEnded));
