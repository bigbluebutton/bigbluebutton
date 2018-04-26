import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Modal from '/imports/ui/components/modal/simple/component';
import _ from 'lodash';
import { styles } from './styles';

const intlMessages = defineMessages({

});

class ShortcutHelpComponent extends Component {
  render() {
    const { intl } = this.props;

    const shortcuts = [
      { keys: 'AcessKey + O', function: 'Open Options',},
      { keys: 'AcessKey + U', function: 'Toggle UserList',},
      { keys: 'AcessKey + M', function: 'Mute / Unmute',},
      { keys: 'AcessKey + J', function: 'Join Audio Modal',},
      { keys: 'AcessKey + L', function: 'Leave Audio',},
      { keys: 'AcessKey + P', function: 'Toggle Public Chat (UserList must be open)',},
      { keys: 'AcessKey + H', function: 'Hide Open Private Chat',},
      { keys: 'AcessKey + G', function: 'Close Open Private Chat',},
      { keys: 'AcessKey + A', function: 'Open Actions Menu',},
      { keys: 'AcessKey + S', function: 'Open Status Menu',},
    ];

    return (
      <Modal
        title={'Hotkeys'}
        dismiss={{
          label: 'close',
          description: "closes the hotkeys modal",
        }}
      >
        <span className={styles.span}>The operation to activate the Hotkeys depends on the browser and its platform.</span>
        <p className={styles.p}><b>Windows / Linux : AcessKey</b></p>
        <p className={styles.p}>
          FireFox : Alt + Shift<br></br>
          Internet Explorer / Google Chrome : Alt
        </p>
        <p className={styles.p}><b>Mac : AcessKey</b></p>
        <p className={styles.p}>
          FireFox / Chrome / Safari : Control + Alt
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