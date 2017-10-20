import React from 'react';
import { ToastContainer as Toastify } from 'react-toastify';
import { createContainer } from 'meteor/react-meteor-data';
import { defineMessages, injectIntl } from 'react-intl';
import { withToast } from '/imports/ui/components/toast/service';

import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';

import Icon from '../icon/component';
import styles from './styles';

const intlMessages = defineMessages({
  notificationRecordingStart: {
    id: 'app.notification.recordingStart',
    description: 'Notification for when the recording start',
  },
  notificationRecordingStop: {
    id: 'app.notification.recordingStop',
    description: 'Notification for when the recording stpop',
  },
});

class ToastContainer extends React.Component {
  // we never want this component to update since will break Toastify
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return <Toastify {...this.props} />;
  }
}

export default injectIntl(withToast(createContainer(({ toastNotify, intl }) => {
  const meetingId = Auth.meetingID;

  Meetings.find({ meetingId }).observeChanges({
    changed: (id, fields) => {
      if (fields.recordProp && fields.recordProp.recording) {
        toastNotify(intl.formatMessage(intlMessages.notificationRecordingStart), 'success', 'record');
      }

      if (fields.recordProp && !fields.recordProp.recording) {
        toastNotify(intl.formatMessage(intlMessages.notificationRecordingStop), 'error', 'record');
      }
    },
  });

  return {
    closeButton: (<Icon className={styles.close} iconName="close" />),
    autoClose: 5000,
    className: styles.container,
    toastClassName: styles.toast,
    bodyClassName: styles.body,
    progressClassName: styles.progress,
    newestOnTop: false,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
  };
}, ToastContainer)));
