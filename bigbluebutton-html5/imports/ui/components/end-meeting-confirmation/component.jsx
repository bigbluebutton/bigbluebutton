import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import Modal from '/imports/ui/components/modal/simple/component';
import { styles } from './styles';

const intlMessages = defineMessages({
  endMeetingTitle: {
    id: 'app.endMeeting.title',
    description: 'end meeting title',
  },
  endMeetingDescription: {
    id: 'app.endMeeting.description',
    description: 'end meeting description with affected users information',
  },
  endMeetingNoUserDescription: {
    id: 'app.endMeeting.noUserDescription',
    description: 'end meeting description',
  },
  contentWarning: {
    id: 'app.endMeeting.contentWarning',
    description: 'end meeting content warning',
  },
  yesLabel: {
    id: 'app.endMeeting.yesLabel',
    description: 'label for yes button for end meeting',
  },
  noLabel: {
    id: 'app.endMeeting.noLabel',
    description: 'label for no button for end meeting',
  },
});

const { warnAboutUnsavedContentOnMeetingEnd } = Meteor.settings.public.app;

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  closeModal: PropTypes.func.isRequired,
  endMeeting: PropTypes.func.isRequired,
  meetingTitle: PropTypes.string.isRequired,
  users: PropTypes.number.isRequired,
};

class EndMeetingComponent extends PureComponent {
  render() {
    const {
      users, intl, closeModal, endMeeting, meetingTitle,
    } = this.props;

    return (
      <Modal
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={closeModal}
        hideBorder
        title={intl.formatMessage(intlMessages.endMeetingTitle, { 0: meetingTitle })}
      >
        <div className={styles.container}>
          <div className={styles.description}>
            {
              users > 0
                ? intl.formatMessage(intlMessages.endMeetingDescription, { 0: users })
                : intl.formatMessage(intlMessages.endMeetingNoUserDescription)
            }
            {
              warnAboutUnsavedContentOnMeetingEnd
                ? (
                  <p>
                    {intl.formatMessage(intlMessages.contentWarning)}
                  </p>
                ) : null
            }
          </div>
          <div className={styles.footer}>
            <Button
              data-test="confirmEndMeeting"
              color="danger"
              className={styles.button}
              label={intl.formatMessage(intlMessages.yesLabel)}
              onClick={endMeeting}
            />
            <Button
              label={intl.formatMessage(intlMessages.noLabel)}
              className={styles.button}
              onClick={closeModal}
            />
          </div>
        </div>
      </Modal>
    );
  }
}

EndMeetingComponent.propTypes = propTypes;

export default injectIntl(EndMeetingComponent);
