import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { defineMessages, injectIntl } from 'react-intl';
import Modal from '/imports/ui/components/modal/component';

const intlMessages = defineMessages({
  title: {
    id: 'app.leaveConfirmation.title',
  },
  message: {
    id: 'app.leaveConfirmation.message',
  },
  confirmLabel: {
    id: 'app.leaveConfirmation.confirmLabel',
  },
  confirmDesc: {
    id: 'app.leaveConfirmation.confirmDesc',
  },
  dismissLabel: {
    id: 'app.leaveConfirmation.dismissLabel',
  },
  dismissDesc: {
    id: 'app.leaveConfirmation.dismissDesc',
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
