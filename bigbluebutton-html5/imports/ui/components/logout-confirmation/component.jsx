import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { defineMessages, injectIntl } from 'react-intl';
import Modal from '/imports/ui/components/modal/fullscreen/component';

const intlMessages = defineMessages({
  title: {
    id: 'app.leaveConfirmation.title',
    description: 'Leave session modal title',
  },
  message: {
    id: 'app.leaveConfirmation.message',
    description: 'message for leaving session',
  },
  confirmLabel: {
    id: 'app.leaveConfirmation.confirmLabel',
    description: 'Confirmation button label',
  },
  confirmDesc: {
    id: 'app.leaveConfirmation.confirmDesc',
    description: 'adds context to confim option',
  },
  dismissLabel: {
    id: 'app.leaveConfirmation.dismissLabel',
    description: 'Dismiss button label',
  },
  dismissDesc: {
    id: 'app.leaveConfirmation.dismissDesc',
    description: 'adds context to dismiss option',
  },
});

class LeaveConfirmation extends Component {
  render() {
    const { intl, router } = this.props;

    return (
      <Modal
        title={intl.formatMessage(intlMessages.title)}
        confirm={{
          callback: () => router.push('/logout'),
          label: intl.formatMessage(intlMessages.confirmLabel),
          description: intl.formatMessage(intlMessages.confirmDesc),
        }}
        dismiss={{
          callback: () => null,
          label: intl.formatMessage(intlMessages.dismissLabel),
          description: intl.formatMessage(intlMessages.dismissDesc),
        }}
      >
        {intl.formatMessage(intlMessages.message)}
      </Modal>
    );
  }
}

export default withRouter(injectIntl(LeaveConfirmation));
