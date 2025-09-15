import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { notify } from '/imports/ui/services/notification';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import Styled from './styles';

const intlMessages = defineMessages({
  wakeLockOfferTitle: {
    id: 'app.toast.wakeLock.offerTitle',
  },
  wakeLockAcquireSuccess: {
    id: 'app.toast.wakeLock.acquireSuccess',
  },
  wakeLockAcquireFailed: {
    id: 'app.toast.wakeLock.acquireFailed',
  },
  wakeLockNotSupported: {
    id: 'app.toast.wakeLock.notSupported',
  },
  wakeLockDisclaimer: {
    id: 'app.toast.wakeLock.disclaimer',
  }
});

const propTypes = {
  intl: PropTypes.objectOf(Object).isRequired,
  request: PropTypes.func.isRequired,
  release: PropTypes.func.isRequired,
  wakeLockSettings: PropTypes.bool.isRequired,
  setLocalSettings: PropTypes.func.isRequired,
};

class WakeLock extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    const { wakeLockSettings } = this.props;

    if (wakeLockSettings) {
      this.requestWakeLock();
    }
  }

  componentDidUpdate(prevProps) {
    const { wakeLockSettings, release } = this.props;
    if (wakeLockSettings !== prevProps.wakeLockSettings) {
      if (wakeLockSettings) {
        this.requestWakeLock();
      } else {
        release();
      }
    }
  }

  getToast(id, message) {
    return (
      <div id={id}>
        <Styled.Title>
          { message }
        </Styled.Title>
      </div>
    );
  }

  feedbackToast(result) {
    const { intl } = this.props;
    
    const feedbackToastProps = {
      closeOnClick: true,
      autoClose: true,
      closeButton: false,
    };

    const toastType = result.error ? 'error' : 'success';
    const message = result.error
      ? intl.formatMessage(intlMessages.wakeLockDisclaimer, {
          error: intl.formatMessage(intlMessages[result.locale])
        })
    : intl.formatMessage(intlMessages.wakeLockAcquireSuccess);
    const feedbackToast = this.getToast('wakeLockToast', message);
    notify(feedbackToast, toastType, 'lock', feedbackToastProps, null, true);
  }

  requestWakeLock () {
    const Settings = getSettingsSingletonInstance();
    const { request, setLocalSettings } = this.props;
    request().then((result) => {
      if (result && result.error) {
        Settings.application.wakeLock = false;
        Settings.save(setLocalSettings);
        this.feedbackToast(result);
      }
    });
  }

  render() {
    return null;
  }
}

WakeLock.propTypes = propTypes;

export default injectIntl(WakeLock);
