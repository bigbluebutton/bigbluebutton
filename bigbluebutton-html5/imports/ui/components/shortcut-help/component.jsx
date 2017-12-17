import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Modal from '/imports/ui/components/modal/simple/component';
import styles from './styles.scss';

const intlMessages = defineMessages({
  shortcutTitle: {
    id: 'app.shortcut-help.shortcutTitle',
    description: 'title for shortcut help modal',
  },
  cancelLabel: {
    id: 'app.shortcut-help.cancelLabel',
    description: 'label for dismiss modal button',
  },
  cancelDesc: {
    id: 'app.shortcut-help.cancelDesc',
    description: 'description for dismiss modal button',
  },
  firstColTitle: {
    id: 'app.shortcut-help.firstColTitle',
    description: 'heading for shortcuts column',
  },
  secondColTitle: {
    id: 'app.shortcut-help.secondColTitle',
    description: 'heading for shortcut function column',
  },
  shortcut001: {
    id: 'app.shortcut-help.shortcut001',
    description: 'Toggle fullscreen shortcut description',
  },
  shortcut002: {
    id: 'app.shortcut-help.shortcut002',
    description: 'Toggle userlist shortcut description',
  },
  shortcut003: {
    id: 'app.shortcut-help.shortcut003',
    description: 'Mute/Unmute shortcut description',
  },
  shortcut004: {
    id: 'app.shortcut-help.shortcut004',
    description: 'Logout shortcut description',
  },
  shortcut005: {
    id: 'app.shortcut-help.shortcut005',
    description: 'Open about shortcut description',
  },
  shortcut006: {
    id: 'app.shortcut-help.shortcut006',
    description: 'Open settings modal shortcut description',
  },
  shortcut007: {
    id: 'app.shortcut-help.shortcut007',
    description: 'Previous slide shortcut description',
  },
  shortcut008: {
    id: 'app.shortcut-help.shortcut008',
    description: 'Next slide shortcut description',
  },
  shortcut009: {
    id: 'app.shortcut-help.shortcut009',
    description: 'Upload presentation shortcut description',
  },
  shortcut010: {
    id: 'app.shortcut-help.shortcut010',
    description: 'Open shortcut help modal description',
  },
});

class ShortcutHelpComponent extends React.PureComponent {
  render() {
    const { intl } = this.props;

    const SHORTCUTS_CONFIG = Meteor.settings.public.shortcuts;
    const shortcuts = Object.values(SHORTCUTS_CONFIG);

    return (
      <Modal
        title={intl.formatMessage(intlMessages.shortcutTitle)}
        dismiss={{
          label: intl.formatMessage(intlMessages.cancelLabel),
          description: intl.formatMessage(intlMessages.cancelDesc),
        }}
      >
        <table className={styles.shortcutTable}>
          <tr>
            <th className={styles.tableTitle}>{intl.formatMessage(intlMessages.firstColTitle)}</th>
            <th className={styles.tableTitle}>{intl.formatMessage(intlMessages.secondColTitle)}</th>
          </tr>
          {shortcuts.map(shortcut => (
            <tr>
              <td className={styles.keyCell}>{shortcut.keys}</td>
              <td className={styles.descCell}>{intl.formatMessage(intlMessages[shortcut.descId])}</td>
            </tr>
          ))}
        </table>
      </Modal>
    );
  }
}

export default injectIntl(ShortcutHelpComponent);
