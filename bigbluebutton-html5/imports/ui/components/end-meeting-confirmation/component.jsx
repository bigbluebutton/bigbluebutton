import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
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
    description: 'end meeting description',
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

const propTypes = {
  intl: intlShape.isRequired,
  closeModal: PropTypes.func.isRequired,
  endMeeting: PropTypes.func.isRequired,
};

class EndMeetingComponent extends React.PureComponent {
  render() {
    const { intl, closeModal, endMeeting } = this.props;

    return (
      <Modal
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={closeModal}
        hideBorder
        title={intl.formatMessage(intlMessages.endMeetingTitle)}
      >
        <div className={styles.container}>
          <div className={styles.description}>
            {intl.formatMessage(intlMessages.endMeetingDescription)}
          </div>
          <div className={styles.footer}>
            <Button
              data-test="confirmEndMeeting"
              color="primary"
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
