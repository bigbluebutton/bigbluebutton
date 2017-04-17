import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { clearModal } from '/imports/ui/components/app/service';
import { exitAudio } from '/imports/api/phone'
import Modal from '/imports/ui/components/modal/component';

const intlMessages = defineMessages({
  title: {
    id: 'app.breakoutJoinConfirmation.title',
  },
  message: {
    id: 'app.breakoutJoinConfirmation.message',
  },
  confirmLabel: {
    id: 'app.breakoutJoinConfirmation.confirmLabel',
  },
  confirmDesc: {
    id: 'app.breakoutJoinConfirmation.confirmDesc',
  },
  dismissLabel: {
    id: 'app.breakoutJoinConfirmation.dismissLabel',
  },
  dismissDesc: {
    id: 'app.breakoutJoinConfirmation.dismissDesc',
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
