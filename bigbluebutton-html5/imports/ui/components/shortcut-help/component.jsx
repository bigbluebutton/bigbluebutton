import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Modal from '/imports/ui/components/modal/simple/component';
import _ from 'lodash';
import { styles } from './styles';

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
});

class ShortcutHelpComponent extends Component {
  render() {
    const { intl } = this.props;

    const shortcuts = [
      { keys: 'Acess Key + O', function: intl.formatMessage(intlMessages.openOptions),},
      { keys: 'Acess Key + U', function: intl.formatMessage(intlMessages.toggleUserList),},
      { keys: 'Acess Key + M', function: intl.formatMessage(intlMessages.toggleMute),},
      { keys: 'Acess Key + J', function: intl.formatMessage(intlMessages.joinAudio),},
      { keys: 'Acess Key + L', function: intl.formatMessage(intlMessages.leaveAudio),},
      { keys: 'Acess Key + P', function: intl.formatMessage(intlMessages.togglePublicChat),},
      { keys: 'Acess Key + H', function: intl.formatMessage(intlMessages.hidePrivateChat),},
      { keys: 'Acess Key + G', function: intl.formatMessage(intlMessages.closePrivateChat),},
      { keys: 'Acess Key + A', function: intl.formatMessage(intlMessages.openActions),},
      { keys: 'Acess Key + S', function: intl.formatMessage(intlMessages.openStatus),},
    ];

    return (
      <Modal
        title={intl.formatMessage(intlMessages.title)}
        dismiss={{
          label: intl.formatMessage(intlMessages.closeLabel),
          description: intl.formatMessage(intlMessages.closeDesc),
        }}
      >
        <span className={styles.span}>The operation to activate the Hotkeys depends on the browser and its platform.</span>
        <p className={styles.p}><b>Windows / Linux : Acess Key</b></p>
        <p className={styles.p}>
          FireFox : Alt + Shift<br></br>
          Chrome  : Alt
        </p>
        <p className={styles.p}><b>Mac : Acess Key</b></p>
        <p className={styles.p}>
          Control + Alt
        </p>
        <table className={styles.shortcutTable}>
            <tbody>
                <tr>
                    <th>{'Combo'}</th>
                    <th>{'Function'}</th>
                </tr>
                {shortcuts.map(shortcut => (
                    <tr key={_.uniqueId('hotkey-item-')}>
                        <td className={styles.keyCell}>{shortcut.keys}</td>
                        <td className={styles.descCell}>{shortcut.function}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </Modal>
    );
  }
}
  
export default injectIntl(ShortcutHelpComponent);