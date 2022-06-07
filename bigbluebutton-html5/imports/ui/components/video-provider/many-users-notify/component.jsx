import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { notify } from '/imports/ui/services/notification';
import Button from '/imports/ui/components/button/component';
import { toast } from 'react-toastify';
import { styles } from './styles';

const intlMessages = defineMessages({
  suggestLockTitle: {
    id: 'app.video.suggestWebcamLock',
    description: 'Label for notification title',
  },
  suggestLockReason: {
    id: 'app.video.suggestWebcamLockReason',
    description: 'Reason for activate the webcams\'s lock',
  },
  enable: {
    id: 'app.video.enable',
    description: 'Enable button label',
  },
  cancel: {
    id: 'app.video.cancel',
    description: 'Cancel button label',
  },
});

const REPEAT_INTERVAL = 120000;

class LockViewersNotifyComponent extends Component {
  constructor(props) {
    super(props);
    this.interval = null;
    this.intervalCallback = this.intervalCallback.bind(this);
  }

  componentDidUpdate() {
    const {
      viewersInWebcam,
      lockSettings,
      limitOfViewersInWebcam,
      webcamOnlyForModerator,
      currentUserIsModerator,
      limitOfViewersInWebcamIsEnable,
    } = this.props;
    const viwerersInWebcamGreaterThatLimit = (viewersInWebcam >= limitOfViewersInWebcam)
    && limitOfViewersInWebcamIsEnable;
    const webcamForViewersIsLocked = lockSettings.disableCam || webcamOnlyForModerator;

    if (viwerersInWebcamGreaterThatLimit
      && !webcamForViewersIsLocked
      && currentUserIsModerator
      && !this.interval) {
      this.interval = setInterval(this.intervalCallback, REPEAT_INTERVAL);
      this.intervalCallback();
    }
    if (webcamForViewersIsLocked || (!viwerersInWebcamGreaterThatLimit && this.interval)) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  intervalCallback() {
    const {
      toggleWebcamsOnlyForModerator,
      intl,
    } = this.props;
    const lockToastId = `suggestLock-${new Date().getTime()}`;

    notify(
      (
        <React.Fragment>
          <p className={styles.info}>{intl.formatMessage(intlMessages.suggestLockTitle)}</p>
          <div className={styles.buttonWrapper}>
            <Button
              label={intl.formatMessage(intlMessages.enable)}
              aria-label={intl.formatMessage(intlMessages.enable)}
              onClick={toggleWebcamsOnlyForModerator}
              className={styles.button}
            />
            |
            <Button
              label={intl.formatMessage(intlMessages.cancel)}
              aria-label={intl.formatMessage(intlMessages.cancel)}
              onClick={() => toast.dismiss(lockToastId)}
              className={styles.button}
            />
          </div>
          <p className={styles.info}>{intl.formatMessage(intlMessages.suggestLockReason)}</p>
        </React.Fragment>
      ),
      'info',
      'rooms',
      {
        toastId: lockToastId,
      },
    );
  }

  render() {
    return null;
  }
}

export default injectIntl(LockViewersNotifyComponent);
