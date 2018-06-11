import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import browser from 'browser-detect';
import Modal from '/imports/ui/components/modal/simple/component';
import _ from 'lodash';
import { styles } from './styles';

const intlMessages = defineMessages({
  title: {
    id: 'app.shortcut-help.title',
    description: 'modal title label',
  },
  closeLabel: {
    id: 'app.shortcut-help.closeLabel',
    description: 'label for close button',
  },
  closeDesc: {
    id: 'app.shortcut-help.closeDesc',
    description: 'description for close button',
  },
  accessKeyNotAvailable: {
    id: 'app.shortcut-help.accessKeyNotAvailable',
    description: 'message shown in place of access key table if not supported',
  },
  comboLabel: {
    id: 'app.shortcut-help.comboLabel',
    description: 'heading for key combo column',
  },
  functionLabel: {
    id: 'app.shortcut-help.functionLabel',
    description: 'heading for shortcut function column',
  },
  openOptions: {
    id: 'app.shortcut-help.openOptions',
    description: 'describes the open options shortcut',
  },
  toggleUserList: {
    id: 'app.shortcut-help.toggleUserList',
    description: 'describes the toggle userlist shortcut',
  },
  toggleMute: {
    id: 'app.shortcut-help.toggleMute',
    description: 'describes the toggle mute shortcut',
  },
  togglePublicChat: {
    id: 'app.shortcut-help.togglePublicChat',
    description: 'describes the toggle public chat shortcut',
  },
  hidePrivateChat: {
    id: 'app.shortcut-help.hidePrivateChat',
    description: 'describes the hide public chat shortcut',
  },
  closePrivateChat: {
    id: 'app.shortcut-help.closePrivateChat',
    description: 'describes the close private chat shortcut',
  },
  openActions: {
    id: 'app.shortcut-help.openActions',
    description: 'describes the open actions shortcut',
  },
  openStatus: {
    id: 'app.shortcut-help.openStatus',
    description: 'describes the open status shortcut',
  },
  joinAudio: {
    id: 'app.audio.joinAudio',
    description: 'describes the join audio shortcut',
  },
  leaveAudio: {
    id: 'app.audio.leaveAudio',
    description: 'describes the leave audio shortcut',
  },
});

const SHORTCUTS_CONFIG = Meteor.settings.public.app.shortcuts;

class ShortcutHelpComponent extends Component {
  render() {
    const { intl } = this.props;
    const shortcuts = Object.values(SHORTCUTS_CONFIG);
    const { name } = browser();

    let accessMod = null;

    switch (name) {
      case 'chrome':
      case 'edge':
        accessMod = 'Alt';
        break;
      case 'firefox':
        accessMod = 'Alt + Shift';
        break;
      case 'safari':
      case 'crios':
      case 'fxios':
        accessMod = 'Control + Alt';
        break;
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
