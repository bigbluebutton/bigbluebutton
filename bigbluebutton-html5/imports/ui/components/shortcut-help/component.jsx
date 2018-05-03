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
  accessKeyNotAvailable: {
    id: 'app.shortcut-help.accessKeyNotAvailable',
  },
  comboLabel: {
    id: 'app.shortcut-help.comboLabel',
  },
  functionLabel: {
    id: 'app.shortcut-help.functionLabel',
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
});

const SHORTCUTS_CONFIG = Meteor.settings.public.app.shortcuts;

class ShortcutHelpComponent extends Component {
  render() {
    const { intl } = this.props;
    const shortcuts = Object.values(SHORTCUTS_CONFIG);

    let accessMod = null;

    if (deviceInfo.osType().isMac) {
      accessMod = 'Control + Alt';
    }

    if (deviceInfo.osType().isWindows || deviceInfo.osType().isLinux) {
      accessMod = deviceInfo.browserType().isFirefox ? 'Alt + Shift' : accessMod;
      accessMod = deviceInfo.browserType().isChrome ? 'Alt' : accessMod;
    }

    return (
      <Modal
        title={intl.formatMessage(intlMessages.title)}
        dismiss={{
          label: intl.formatMessage(intlMessages.closeLabel),
          description: intl.formatMessage(intlMessages.closeDesc),
        }}
      >
        { !accessMod ? <p>{intl.formatMessage(intlMessages.accessKeyNotAvailable)}</p> :
        <span>
          <table className={styles.shortcutTable}>
            <tbody>
              <tr>
                <th>{intl.formatMessage(intlMessages.comboLabel)}</th>
                <th>{intl.formatMessage(intlMessages.functionLabel)}</th>
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
