import React from 'react';
import Breakouts from '/imports/api/2.0/breakouts';
import { ToastContainer as Toastify } from 'react-toastify';
import { createContainer } from 'meteor/react-meteor-data';
import { defineMessages, injectIntl } from 'react-intl';
import { withToast } from '/imports/ui/components/toast/service';
import Icon from '../icon/component';
import styles from './styles';

const intlMessages = defineMessages({
  toastBreakoutRoomEnded: {
    id: 'app.toast.BreakoutRoomEnded',
    description: 'message when the breakout room is ended',
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

export default injectIntl(withToast(createContainer(({
  toastNotify,
  intl,
}) => {
  Breakouts.find().observeChanges({
    removed() {
      toastNotify(intl.formatMessage(intlMessages.toastBreakoutRoomEnded), 'info', 'rooms');
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
