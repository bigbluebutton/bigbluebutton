import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import browser from 'browser-detect';
import Modal from '/imports/ui/components/modal/simple/component';
import _ from 'lodash';
import { styles } from './styles';
import withShortcutHelper from './service';

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
  togglePan: {
    id: 'app.shortcut-help.togglePan',
    description: 'describes the toggle pan shortcut',
  },
  nextSlideDesc: {
    id: 'app.shortcut-help.nextSlideDesc',
    description: 'describes the next slide shortcut',
  },
  previousSlideDesc: {
    id: 'app.shortcut-help.previousSlideDesc',
    description: 'describes the previous slide shortcut',
  },
});

const CHAT_CONFIG = Meteor.settings.public.chat;
const CHAT_ENABLED = CHAT_CONFIG.enabled;

const ShortcutHelpComponent = (props) => {
  const { intl, shortcuts } = props;
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
    default:
      break;
  }

  const shortcutItems = shortcuts.map((shortcut) => {
    if (!CHAT_ENABLED && shortcut.descId.indexOf('Chat') !== -1) return null;

    return (
      <tr key={_.uniqueId('hotkey-item-')}>
        <td className={styles.keyCell}>{`${accessMod} + ${shortcut.accesskey}`}</td>
        <td className={styles.descCell}>{intl.formatMessage(intlMessages[`${shortcut.descId}`])}</td>
      </tr>
    );
  });

  shortcutItems.push((
    <tr key={_.uniqueId('hotkey-item-')}>
      <td className={styles.keyCell}>Spacebar</td>
      <td className={styles.descCell}>{intl.formatMessage(intlMessages.togglePan)}</td>
    </tr>
  ));

  shortcutItems.push((
    <tr key={_.uniqueId('hotkey-item-')}>
      <td className={styles.keyCell}>Right Arrow</td>
      <td className={styles.descCell}>{intl.formatMessage(intlMessages.nextSlideDesc)}</td>
    </tr>
  ));

  shortcutItems.push((
    <tr key={_.uniqueId('hotkey-item-')}>
      <td className={styles.keyCell}>Left Arrow</td>
      <td className={styles.descCell}>{intl.formatMessage(intlMessages.previousSlideDesc)}</td>
    </tr>
  ));

  return (
    <Modal
      title={intl.formatMessage(intlMessages.title)}
      dismiss={{
        label: intl.formatMessage(intlMessages.closeLabel),
        description: intl.formatMessage(intlMessages.closeDesc),
      }}
    >
      {!accessMod ? <p>{intl.formatMessage(intlMessages.accessKeyNotAvailable)}</p>
        : (
          <span>
            <table className={styles.shortcutTable}>
              <tbody>
                <tr>
                  <th>{intl.formatMessage(intlMessages.comboLabel)}</th>
                  <th>{intl.formatMessage(intlMessages.functionLabel)}</th>
                </tr>
                {shortcutItems}
              </tbody>
            </table>
          </span>
        )
      }
    </Modal>
  );
};

ShortcutHelpComponent.defaultProps = {
  intl: intlShape,
};

ShortcutHelpComponent.propTypes = {
  intl: intlShape,
  shortcuts: PropTypes.arrayOf(PropTypes.shape({
    accesskey: PropTypes.string.isRequired,
    descId: PropTypes.string.isRequired,
  })).isRequired,
};

export default withShortcutHelper(injectIntl(ShortcutHelpComponent));
