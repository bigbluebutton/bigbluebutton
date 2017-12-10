import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Modal from '/imports/ui/components/modal/simple/component';

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
  shortcutFunc001: {
    id: 'app.shortcut-help.shortcutFunc001',
    description: 'Toggle fullscreen shortcut description',
  },
  shortcutFunc002: {
    id: 'app.shortcut-help.shortcutFunc002',
    description: 'Toggle userlist shortcut description',
  },
  shortcutFunc003: {
    id: 'app.shortcut-help.shortcutFunc003',
    description: 'Mute/Unmute shortcut description',
  },
  shortcutFunc004: {
    id: 'app.shortcut-help.shortcutFunc004',
    description: 'Logout shortcut description',
  },
  shortcutFunc005: {
    id: 'app.shortcut-help.shortcutFunc005',
    description: 'Open about shortcut description',
  },
  shortcutFunc006: {
    id: 'app.shortcut-help.shortcutFunc006',
    description: 'Open settings modal shortcut description',
  },
  shortcutFunc007: {
    id: 'app.shortcut-help.shortcutFunc007',
    description: 'Previous slide shortcut description',
  },
  shortcutFunc008: {
    id: 'app.shortcut-help.shortcutFunc008',
    description: 'Next slide shortcut description',
  },
  shortcutFunc009: {
    id: 'app.shortcut-help.shortcutFunc009',
    description: 'Upload presentation shortcut description',
  },
});

class ShortcutHelpComponent extends Component {
  render() {
    const { intl } = this.props;

    const shortcuts = [
      { keys: 'Control+Alt+0', function: intl.formatMessage(intlMessages.shortcutFunc001) },
      { keys: 'Control+Alt+1', function: intl.formatMessage(intlMessages.shortcutFunc002) },
      { keys: 'Control+Alt+M', function: intl.formatMessage(intlMessages.shortcutFunc003) },
      { keys: 'Control+Alt+L', function: intl.formatMessage(intlMessages.shortcutFunc004) },
      { keys: 'Control+Alt+8', function: intl.formatMessage(intlMessages.shortcutFunc005) },
      { keys: 'Control+Alt+9', function: intl.formatMessage(intlMessages.shortcutFunc006) },
      { keys: 'Control+Shift+A', function: intl.formatMessage(intlMessages.shortcutFunc007) },
      { keys: 'Control+Shift+E', function: intl.formatMessage(intlMessages.shortcutFunc008) },
      { keys: 'Control+Shift+Y', function: intl.formatMessage(intlMessages.shortcutFunc009) },
    ];

    return (
      <Modal
        title={intl.formatMessage(intlMessages.shortcutTitle)}
        dismiss={{
          label: intl.formatMessage(intlMessages.cancelLabel),
          description: intl.formatMessage(intlMessages.cancelDesc),
        }}
      >
        <table>
          <tr>
            <th>{intl.formatMessage(intlMessages.firstColTitle)}</th>
            <th>{intl.formatMessage(intlMessages.secondColTitle)}</th>
          </tr>
          {shortcuts.map(shortcut => (
            <tr>
              <td>{shortcut.keys}</td>
              <td>{shortcut.function}</td>
            </tr>
          ))}
        </table>
      </Modal>
    );
  }
}

export default injectIntl(ShortcutHelpComponent);
