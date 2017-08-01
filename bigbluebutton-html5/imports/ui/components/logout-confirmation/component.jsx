import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { defineMessages, injectIntl } from 'react-intl';
import { makeCall } from '/imports/ui/services/api';
import Modal from '/imports/ui/components/modal/fullscreen/component';
import Auth from '/imports/ui/services/auth';

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
  endMeetingLabel: {
    id: 'app.leaveConfirmation.endMeetingLabel',
    description: 'End meeting button label',
  },
  endMeetingDesc: {
    id: 'app.leaveConfirmation.endMeetingDesc',
    description: 'adds context to end meeting option',
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
        others={{
          callback: () => makeCall('endMeeting', Auth.credentials),
          label: intl.formatMessage(intlMessages.endMeetingLabel),
          description: intl.formatMessage(intlMessages.endMeetingDesc),
        }}
      >
        {intl.formatMessage(intlMessages.message)}
      </Modal>
    );
  }
}

export default withRouter(injectIntl(LeaveConfirmation));
