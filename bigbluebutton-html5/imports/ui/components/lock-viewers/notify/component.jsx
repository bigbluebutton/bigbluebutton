import { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { notify } from '/imports/ui/services/notification';
import _ from 'lodash';

const intlMessages = defineMessages({
  disableCam: {
    id: 'app.userList.userOptions.disableCam',
    description: 'label to disable cam notification',
  },
  disableMic: {
    id: 'app.userList.userOptions.disableMic',
    description: 'label to disable mic notification',
  },
  disablePrivChat: {
    id: 'app.userList.userOptions.disablePrivChat',
    description: 'label to disable private chat notification',
  },
  disablePubChat: {
    id: 'app.userList.userOptions.disablePubChat',
    description: 'label to disable private chat notification',
  },
  onlyModeratorWebcam: {
    id: 'app.userList.userOptions.webcamsOnlyForModerator',
    description: 'label to disable all webcams except for the moderators cam',
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

    if (!_.isEqual(lockSettings, prevLockSettings)) {
      const rejectedKeys = ['setBy', 'lockedLayout'];
      const filteredSettings = Object.keys(lockSettings)
        .filter(key => prevLockSettings[key] !== lockSettings[key]
          && lockSettings[key]
          && !rejectedKeys.includes(key));
      filteredSettings.forEach((key) => {
        notify(intl.formatMessage(intlMessages[key]), 'info', 'lock');
      });
    }
    if (webcamsOnlyForModerator && !prevWebcamsOnlyForModerator) {
      notify(intl.formatMessage(intlMessages.onlyModeratorWebcam), 'info', 'lock');
    }
  }

  render() {
    return null;
  }
}

export default injectIntl(LockViewersNotifyComponent);
