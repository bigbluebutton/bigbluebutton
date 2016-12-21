import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Auth from '/imports/ui/services/auth';
import Modal from '/imports/ui/components/modal/component';
import LocalStorage from '/imports/ui/services/storage/local.js';
import { clearModal } from '/imports/ui/components/app/service';

const intlMessages = defineMessages({
  title: {
    id: 'app.leaveConfirmation.title',
    defaultMessage: 'Leave Session',
  },
  message: {
    id: 'app.leaveConfirmation.message',
    defaultMessage: 'Do you want to leave this meeting?',
  },
  confirmLabel: {
    id: 'app.leaveConfirmation.confirmLabel',
    defaultMessage: 'Leave',
  },
  confirmDesc: {
    id: 'app.leaveConfirmation.confirmDesc',
    defaultMessage: 'Logs you out of the meeting',
  },
  dismissLabel: {
    id: 'app.leaveConfirmation.dismissLabel',
    defaultMessage: 'Cancel',
  },
  dismissDesc: {
    id: 'app.leaveConfirmation.dismissDesc',
    defaultMessage: 'Closes and rejects the leave confirmation',
  },
});

class LeaveConfirmation extends Component {
  constructor(props) {
    super(props);

    this.handleLeaveConfirmation = this.handleLeaveConfirmation.bind(this);
    this.handleCancleLogout = this.handleCancleLogout.bind(this);
  }

  handleLeaveConfirmation() {
    Auth.completeLogout();
  }

  handleCancleLogout() {
    clearModal();
  }

  render() {
    const { intl } = this.props;
    return (
      <Modal
        title={intl.formatMessage(intlMessages.title)}
        confirm={{
          callback: this.handleLeaveConfirmation,
          label: intl.formatMessage(intlMessages.confirmLabel),
          description: intl.formatMessage(intlMessages.confirmDesc),
        }}
        dismiss={{
          callback: this.handleCancleLogout,
          label: intl.formatMessage(intlMessages.dismissLabel),
          description: intl.formatMessage(intlMessages.dismissDesc),
        }}>
        {intl.formatMessage(intlMessages.message)}
      </Modal>
    );
  }
};

export default injectIntl(LeaveConfirmation);
