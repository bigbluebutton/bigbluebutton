import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { clearModal } from '/imports/ui/components/app/service';
import { exitAudio } from '/imports/api/phone';
import Modal from '/imports/ui/components/modal/fullscreen/component';

const intlMessages = defineMessages({
  title: {
    id: 'app.breakoutJoinConfirmation.title',
    defaultMessage: 'Join Breakout Room',
  },
  message: {
    id: 'app.breakoutJoinConfirmation.message',
    defaultMessage: 'Do you want to join',
  },
  confirmLabel: {
    id: 'app.breakoutJoinConfirmation.confirmLabel',
    defaultMessage: 'Join',
  },
  confirmDesc: {
    id: 'app.breakoutJoinConfirmation.confirmDesc',
    defaultMessage: 'Join you to the Breakout Room',
  },
  dismissLabel: {
    id: 'app.breakoutJoinConfirmation.dismissLabel',
    defaultMessage: 'Cancel',
  },
  dismissDesc: {
    id: 'app.breakoutJoinConfirmation.dismissDesc',
    defaultMessage: 'Closes and rejects Joining the Breakout Room',
  },
});

class BreakoutJoinConfirmation extends Component {
  constructor(props) {
    super(props);

    this.handleJoinBreakoutConfirmation = this.handleJoinBreakoutConfirmation.bind(this);
  }

  handleJoinBreakoutConfirmation() {
    const { breakoutURL } = this.props;

    // leave main room's audio when joining a breakout room
    exitAudio();

    window.open(breakoutURL);
    clearModal();
  }

  render() {
    const { intl, breakoutName } = this.props;
    return (
      <Modal
        title={intl.formatMessage(intlMessages.title)}
        confirm={{
          callback: this.handleJoinBreakoutConfirmation,
          label: intl.formatMessage(intlMessages.confirmLabel),
          description: intl.formatMessage(intlMessages.confirmDesc),
        }}
        dismiss={{
          label: intl.formatMessage(intlMessages.dismissLabel),
          description: intl.formatMessage(intlMessages.dismissDesc),
        }}>
        {`${intl.formatMessage(intlMessages.message)} ${breakoutName}?`}
      </Modal>
    );
  }
};

export default injectIntl(BreakoutJoinConfirmation);
