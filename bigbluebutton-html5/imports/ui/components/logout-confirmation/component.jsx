import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { defineMessages, injectIntl } from 'react-intl';
import Modal from '/imports/ui/components/modal/component';

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
        }}>
        {intl.formatMessage(intlMessages.message)}
      </Modal>
    );
  }
};

export default withRouter(injectIntl(LeaveConfirmation));
