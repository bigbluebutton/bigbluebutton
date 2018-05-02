import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Modal from '/imports/ui/components/modal/simple/component';
import _ from 'lodash';
import { styles } from './styles';
import deviceInfo from '/imports/utils/deviceInfo';

const intlMessages = defineMessages({
  title: {
    id: 'app.shortcut-help.title',
  },
  closeLabel: {
    id: 'app.shortcut-help.closeLabel',
  },
  closeDesc: {
    id: 'app.shortcut-help.closeDesc',
  },
  openOptions: {
    id: 'app.shortcut-help.openOptions',
  },
  toggleUserList: {
    id: 'app.shortcut-help.toggleUserList',
  },
  toggleMute: {
    id: 'app.shortcut-help.toggleMute',
  },
  togglePublicChat: {
    id: 'app.shortcut-help.togglePublicChat',
  },
  hidePrivateChat: {
    id: 'app.shortcut-help.hidePrivateChat',
  },
  closePrivateChat: {
    id: 'app.shortcut-help.closePrivateChat',
  },
  openActions: {
    id: 'app.shortcut-help.openActions',
  },
  openStatus: {
    id: 'app.shortcut-help.openStatus',
  },
  joinAudio: {
    id: 'app.audio.joinAudio',
  },
  leaveAudio: {
    id: 'app.audio.leaveAudio',
  },
  accesskeyDesc: {
    id: 'app.shortcut-help.accessKeyDesc',
  },
});

const SHORTCUTS_CONFIG = Meteor.settings.public.app.shortcuts;

class ShortcutHelpComponent extends Component {
  render() {
    const { intl } = this.props;
    const shortcuts = Object.values(SHORTCUTS_CONFIG);

    const os = deviceInfo.osType().isWindows
      ? 'Windows'
      : deviceInfo.osType().isMac
        ? 'Mac'
        : deviceInfo.osType().isLinux
          ? 'Linux'
          : null;

    const browser = deviceInfo.browserType().isChrome
      ? 'Chrome'
      : deviceInfo.browserType().isFirefox
        ? 'Firefox'
        : deviceInfo.browserType().isSafari
          ? 'Safari'
          : null;

    let accessMod = 'n/a';

    if (deviceInfo.osType().isMac) {
      accessMod = 'Control + Alt';
    }

    if (deviceInfo.osType().isWindows || deviceInfo.osType().isLinux) {
      if (deviceInfo.browserType().isFirefox) accessMod = 'Alt + Shift';
      if (deviceInfo.browserType().isChrome) accessMod = 'Alt';
    }

    return (
      <Modal
        title={intl.formatMessage(intlMessages.title)}
        dismiss={{
          label: intl.formatMessage(intlMessages.closeLabel),
          description: intl.formatMessage(intlMessages.closeDesc),
        }}
      >
        <span className={styles.span}>{intl.formatMessage(intlMessages.accesskeyDesc)}</span>
        { accessMod === 'n/a' ? <p>Access keys not available.</p> :
        <span>
          <p>{os} : {browser}</p>
          <p>Access Modifier : {accessMod}</p>
          <br />
          <table className={styles.shortcutTable}>
            <tbody>
              <tr>
                <th>Combo</th>
                <th>Function</th>
              </tr>
              {shortcuts.map(shortcut => (
                <tr key={_.uniqueId('hotkey-item-')}>
                  <td className={styles.keyCell}>{`${accessMod} + ${shortcut.accesskey}`}</td>
                  <td className={styles.descCell}>{intl.formatMessage(intlMessages[`${shortcut.descId}`])}</td>
                </tr>
                  ))}
            </tbody>
          </table>
        </span>
        }
      </Modal>
    );
  }
}

export default injectIntl(ShortcutHelpComponent);
