import { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { notify } from '/imports/ui/services/notification';
import _ from 'lodash';

const intlDisableMessages = defineMessages({
  disableCam: {
    id: 'app.userList.userOptions.disableCam',
    description: 'label to disable cam notification',
  },
  disableMic: {
    id: 'app.userList.userOptions.disableMic',
    description: 'label to disable mic notification',
  },
  disablePrivateChat: {
    id: 'app.userList.userOptions.disablePrivChat',
    description: 'label to disable private chat notification',
  },
  disablePublicChat: {
    id: 'app.userList.userOptions.disablePubChat',
    description: 'label to disable private chat notification',
  },
  disableNote: {
    id: 'app.userList.userOptions.disableNote',
    description: 'label to disable note notification',
  },
  hideUserList: {
    id: 'app.userList.userOptions.hideUserList',
    description: 'label to hide user list notification',
  },
  onlyModeratorWebcam: {
    id: 'app.userList.userOptions.webcamsOnlyForModerator',
    description: 'label to disable all webcams except for the moderators cam',
  },
});

const intlEnableMessages = defineMessages({
  disableCam: {
    id: 'app.userList.userOptions.enableCam',
    description: 'label to enable cam notification',
  },
  disableMic: {
    id: 'app.userList.userOptions.enableMic',
    description: 'label to enable mic notification',
  },
  disablePrivateChat: {
    id: 'app.userList.userOptions.enablePrivChat',
    description: 'label to enable private chat notification',
  },
  disablePublicChat: {
    id: 'app.userList.userOptions.enablePubChat',
    description: 'label to enable private chat notification',
  },
  disableNote: {
    id: 'app.userList.userOptions.enableNote',
    description: 'label to enable note notification',
  },
  hideUserList: {
    id: 'app.userList.userOptions.showUserList',
    description: 'label to show user list notification',
  },
  onlyModeratorWebcam: {
    id: 'app.userList.userOptions.enableOnlyModeratorWebcam',
    description: 'label to enable all webcams except for the moderators cam',
  },
});

class LockViewersNotifyComponent extends Component {
  componentDidUpdate(prevProps) {
    const {
      lockSettings,
      intl,
      webcamsOnlyForModerator,
    } = this.props;

    const {
      lockSettings: prevLockSettings,
      webcamsOnlyForModerator: prevWebcamsOnlyForModerator,
    } = prevProps;

    function notifyLocks(arrLocks, intlMessages) {
      arrLocks.forEach((key) => {
        notify(intl.formatMessage(intlMessages[key]), 'info', 'lock');
      });
    }

    if (!_.isEqual(lockSettings, prevLockSettings)) {
      const rejectedKeys = ['setBy', 'lockedLayout'];

      const disabledSettings = Object.keys(lockSettings)
        .filter(key => prevLockSettings[key] !== lockSettings[key]
          && lockSettings[key]
          && !rejectedKeys.includes(key));
      const enableSettings = Object.keys(lockSettings)
        .filter(key => prevLockSettings[key] !== lockSettings[key]
          && !lockSettings[key]
          && !rejectedKeys.includes(key));

      if (disabledSettings.length > 0) {
        notifyLocks(disabledSettings, intlDisableMessages);
      }
      if (enableSettings.length > 0) {
        notifyLocks(enableSettings, intlEnableMessages);
      }
    }
    if (webcamsOnlyForModerator && !prevWebcamsOnlyForModerator) {
      notify(intl.formatMessage(intlDisableMessages.onlyModeratorWebcam), 'info', 'lock');
    }
    if (!webcamsOnlyForModerator && prevWebcamsOnlyForModerator) {
      notify(intl.formatMessage(intlEnableMessages.onlyModeratorWebcam), 'info', 'lock');
    }
  }

  render() {
    return null;
  }
}

export default injectIntl(LockViewersNotifyComponent);
