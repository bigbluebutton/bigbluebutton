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
  accesskeyDesc: {
    id: 'app.shortcut-help.accessKeyDesc',
  },
});

class ShortcutHelpComponent extends Component {
  render() {
    const { intl } = this.props;

    const SHORTCUTS_CONFIG = Meteor.settings.public.app.shortcuts;
    const shortcuts = Object.values(SHORTCUTS_CONFIG);

    return (
      <Modal
        title={intl.formatMessage(intlMessages.title)}
        dismiss={{
          label: intl.formatMessage(intlMessages.closeLabel),
          description: intl.formatMessage(intlMessages.closeDesc),
        }}
      >
        <span className={styles.span}>{intl.formatMessage(intlMessages.accesskeyDesc)}</span>
        <p className={styles.p}>
          <br /><b>Windows / Linux </b><br />
          <b><i>FireFox</i></b> = Alt + Shift &nbsp;
          <b><i>Chrome</i></b>  = Alt
          <br /><br /><b>Mac</b><br />
          <b><i>Safari</i></b>  = Control + Alt
        </p>
        <br />
        <table className={styles.shortcutTable}>
          <tbody>
            <tr>
              <th>Combo</th>
              <th>Function</th>
            </tr>
            {shortcuts.map(shortcut => (
              <tr key={_.uniqueId('hotkey-item-')}>
                <td className={styles.keyCell}>{`Access key + ${shortcut.accesskey}`}</td>
                <td className={styles.descCell}>{intl.formatMessage(intlMessages[`${shortcut.descId}`])}</td>
              </tr>
                ))}
          </tbody>
        </table>
      </Modal>
    );
  }
}

export default injectIntl(ShortcutHelpComponent);
