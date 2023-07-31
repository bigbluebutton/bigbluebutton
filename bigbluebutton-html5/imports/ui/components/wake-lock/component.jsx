import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { toast } from 'react-toastify';
import { notify } from '/imports/ui/services/notification';
import Settings from '/imports/ui/services/settings';
import Styled from './styles';

const intlMessages = defineMessages({
  wakeLockOfferTitle: {
    id: 'app.toast.wakeLock.offerTitle',
  },
  wakeLockOfferAcceptButton: {
    id: 'app.toast.wakeLock.offerAccept',
  },
  wakeLockOfferDeclineButton: {
    id: 'app.toast.wakeLock.offerDecline',
  },
  wakeLockAcquireSuccess: {
    id: 'app.toast.wakeLock.acquireSuccess',
  },
  wakeLockAcquireFailed: {
    id: 'app.toast.wakeLock.acquireFailed',
  },
});

const propTypes = {
  intl: PropTypes.objectOf(Object).isRequired,
  request: PropTypes.func.isRequired,
  release: PropTypes.func.isRequired,
  wakeLockSettings: PropTypes.bool.isRequired,
};

class WakeLock extends Component {
  constructor() {
    super();
    this.notification = null;
  }

  componentDidMount() {
    const { intl, request } = this.props;

    const toastProps = {
      closeOnClick: false,
      autoClose: false,
      closeButton: false,
    };

    const closeNotification = () => {
      toast.dismiss(this.notification);
      this.notification = null;
    };

    const declineButton = () => (
      <Styled.CloseButton
        type="button"
        onClick={closeNotification}
      >
        { intl.formatMessage(intlMessages.wakeLockOfferDeclineButton) }
      </Styled.CloseButton>
    );

    const acceptButton = () => (
      <Styled.AcceptButton
        type="button"
        onClick={async () => {
          closeNotification();
          const error = await request();
          if (!error) {
            Settings.application.wakeLock = true;
            Settings.save();
          }
          this.feedbackToast(error);
        }}
      >
        { intl.formatMessage(intlMessages.wakeLockOfferAcceptButton) }
      </Styled.AcceptButton>
    );

    const toastContent = this.getToast('wakeLockOffer', 'wakeLockOfferTitle', acceptButton(), declineButton());
    this.notification = notify(toastContent, 'default', 'lock', toastProps, null, true);
  }

  getToast(id, title, acceptButton, declineButton) {
    const { intl } = this.props;

    return (
      <div id={id}>
        <Styled.Title>
          { intl.formatMessage(intlMessages[title]) }
        </Styled.Title>
        <Styled.ToastButtons>
          { acceptButton }
          { declineButton }
        </Styled.ToastButtons>
      </div>
    );
  }

  feedbackToast(error) {
    const feedbackToastProps = {
      closeOnClick: true,
      autoClose: true,
      closeButton: false,
    };

    const feedbackToast = this.getToast(error ? 'wakeLockFailed' : 'wakeLockSuccess',
      error ? 'wakeLockAcquireFailed' : 'wakeLockAcquireSuccess', null, null);
    setTimeout(() => {
      notify(feedbackToast, error ? 'error' : 'success', 'lock', feedbackToastProps, null, true);
    }, 800);
  }

  render() {
    const { wakeLockSettings, request, release } = this.props;
    if (wakeLockSettings) {
      request().then((error) => {
        if (error) {
          this.feedbackToast(error);
          Settings.application.wakeLock = false;
          Settings.save();
        }
      });
    } else {
      release();
    }
    return null;
  }
}

WakeLock.propTypes = propTypes;

export default injectIntl(WakeLock);
