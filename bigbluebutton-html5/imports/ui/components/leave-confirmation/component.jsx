import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Auth from '/imports/ui/services/auth';
import Modal from '/imports/ui/components/modal/component';

const intlMessages = defineMessages({
  title: {
    id: 'app.leaveConfirmation.title',
    defaultMessage: 'Leave Session',
    description: 'Leave session confirmation title',
  },
  message: {
    id: 'app.leaveConfirmation.message',
    defaultMessage: 'Do you want to leave this meeting?',
    description: 'Leave session confirmation message',
  },
  confirmBtn: {
    id: 'app.leaveConfirmation.confirmBtn',
    defaultMessage: 'Leave',
    description: 'Leave session confirmation button',
  },
  dismissBtn: {
    id: 'app.leaveConfirmation.dismissBtn',
    defaultMessage: 'Cancel',
    description: 'Leave session dismiss button',
  },
});

class LeaveConfirmation extends Component {
  constructor(props) {
    super(props);

    this.handleLeaveConfirmation = this.handleLeaveConfirmation.bind(this);
  }

  handleLeaveConfirmation() {
    Auth.completeLogout();
  }

  render() {
    const { intl } = this.props;
    return (
      <Modal
        title={intl.formatMessage(intlMessages.title)}
        confirm={{
          callback: this.handleLeave,
          label: intl.formatMessage(intlMessages.confirmBtn),
          description: null,
        }}
        dismiss={{
          label: intl.formatMessage(intlMessages.dismissBtn),
          description: null,
        }}>
        {intl.formatMessage(intlMessages.message)}
      </Modal>
    );
  }
};

export default injectIntl(LeaveConfirmation);
