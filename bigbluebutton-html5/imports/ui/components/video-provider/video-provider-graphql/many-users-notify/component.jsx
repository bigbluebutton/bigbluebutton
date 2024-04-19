import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { notify } from '/imports/ui/services/notification';
import { toast } from 'react-toastify';
import Styled from './styles';

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
        <>
          <Styled.Info>{intl.formatMessage(intlMessages.suggestLockTitle)}</Styled.Info>
          <Styled.ButtonWrapper>
            <Styled.ManyUsersButton
              label={intl.formatMessage(intlMessages.enable)}
              aria-label={intl.formatMessage(intlMessages.enable)}
              onClick={toggleWebcamsOnlyForModerator}
            />
            |
            <Styled.ManyUsersButton
              label={intl.formatMessage(intlMessages.cancel)}
              aria-label={intl.formatMessage(intlMessages.cancel)}
              onClick={() => toast.dismiss(lockToastId)}
            />
          </Styled.ButtonWrapper>
          <Styled.Info>{intl.formatMessage(intlMessages.suggestLockReason)}</Styled.Info>
        </>
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
