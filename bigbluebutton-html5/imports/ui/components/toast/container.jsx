import React from 'react';
import Breakouts from '/imports/api/breakouts';
import { ToastContainer as Toastify } from 'react-toastify';
import { withTracker } from 'meteor/react-meteor-data';
import { defineMessages, injectIntl } from 'react-intl';
import injectNotify from '/imports/ui/components/toast/inject-notify/component';

import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';

import Icon from '../icon/component';
import { styles } from './styles';
import AudioService from '../audio/service';

let breakoutNotified = false;
const intlMessages = defineMessages({

  toastBreakoutRoomEnded: {
    id: 'app.toast.breakoutRoomEnded',
    description: 'message when the breakout room is ended',
  },
  notificationRecordingStart: {
    id: 'app.notification.recordingStart',
    description: 'Notification for when the recording starts',
  },
  notificationRecordingStop: {
    id: 'app.notification.recordingStop',
    description: 'Notification for when the recording stops',
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

export default injectIntl(injectNotify(withTracker(({ notify, intl }) => {
  Breakouts.find().observeChanges({
    added() {
      breakoutNotified = false;
    },
    removed() {
      if (!AudioService.isUsingAudio() && !breakoutNotified) {
        notify(intl.formatMessage(intlMessages.toastBreakoutRoomEnded), 'info', 'rooms');
        breakoutNotified = true;
      }
    },
  });

  const meetingId = Auth.meetingID;

  Meetings.find({ meetingId }).observe({
    changed: (newDocument, oldDocument) => {
      if (newDocument.recordProp && newDocument.recordProp.recording
        && newDocument.recordProp.recording !== oldDocument.recordProp.recording) {
        notify(intl.formatMessage(intlMessages.notificationRecordingStart), 'success', 'record');
      }

      if (newDocument.recordProp && !newDocument.recordProp.recording
        && newDocument.recordProp.recording !== oldDocument.recordProp.recording) {
        notify(intl.formatMessage(intlMessages.notificationRecordingStop), 'error', 'record');
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
})(ToastContainer)));
