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
  constructor(props) {
    super(props);
    const {
      closeModal,
      endMeeting,
    } = props;

    this.closeModal = closeModal;
    this.endMeeting = endMeeting;
  }

  render() {
    const { intl } = this.props;

    return (
      <Modal
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={this.closeModal}
        hideBorder
      >
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.title}>
              {intl.formatMessage(intlMessages.endMeetingTitle)}
            </div>
          </div>
          <div className={styles.description}>
            {intl.formatMessage(intlMessages.endMeetingDescription)}
          </div>
          <div className={styles.footer}>
            <Button
              color="primary"
              className={styles.button}
              label={intl.formatMessage(intlMessages.yesLabel)}
              onClick={() => this.endMeeting()}
            />
            <Button
              label={intl.formatMessage(intlMessages.noLabel)}
              className={styles.button}
              onClick={() => this.closeModal()}
            />
          </div>
        </div>
      </Modal>
    );
  }
}

EndMeetingComponent.propTypes = propTypes;

export default injectIntl(EndMeetingComponent);
