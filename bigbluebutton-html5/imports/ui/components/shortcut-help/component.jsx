import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import browserInfo from '/imports/utils/browserInfo';
import deviceInfo from '/imports/utils/deviceInfo';
import Modal from '/imports/ui/components/common/modal/simple/component';
import _ from 'lodash';
import Styled from './styles';
import withShortcutHelper from './service';
import { isChatEnabled } from '/imports/ui/services/features';

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
  openoptions: {
    id: 'app.shortcut-help.openOptions',
    description: 'describes the open options shortcut',
  },
  toggleuserlist: {
    id: 'app.shortcut-help.toggleUserList',
    description: 'describes the toggle userlist shortcut',
  },
  togglemute: {
    id: 'app.shortcut-help.toggleMute',
    description: 'describes the toggle mute shortcut',
  },
  togglepublicchat: {
    id: 'app.shortcut-help.togglePublicChat',
    description: 'describes the toggle public chat shortcut',
  },
  hideprivatechat: {
    id: 'app.shortcut-help.hidePrivateChat',
    description: 'describes the hide public chat shortcut',
  },
  closeprivatechat: {
    id: 'app.shortcut-help.closePrivateChat',
    description: 'describes the close private chat shortcut',
  },
  openactions: {
    id: 'app.shortcut-help.openActions',
    description: 'describes the open actions shortcut',
  },
  opendebugwindow: {
    id: 'app.shortcut-help.openDebugWindow',
    description: 'describes the open debug window shortcut',
  },
  openstatus: {
    id: 'app.shortcut-help.openStatus',
    description: 'describes the open status shortcut',
  },
  joinaudio: {
    id: 'app.audio.joinAudio',
    description: 'describes the join audio shortcut',
  },
  leaveaudio: {
    id: 'app.audio.leaveAudio',
    description: 'describes the leave audio shortcut',
  },
  raisehand: {
    id: 'app.shortcut-help.raiseHand',
    description: 'describes the toggle raise hand shortcut',
  },
  togglePan: {
    id: 'app.shortcut-help.togglePan',
    description: 'describes the toggle pan shortcut',
  },
  toggleFullscreen: {
    id: 'app.shortcut-help.toggleFullscreen',
    description: 'describes the toggle full-screen shortcut',
  },
  nextSlideDesc: {
    id: 'app.shortcut-help.nextSlideDesc',
    description: 'describes the next slide shortcut',
  },
  previousSlideDesc: {
    id: 'app.shortcut-help.previousSlideDesc',
    description: 'describes the previous slide shortcut',
  },
  togglePanKey: {
    id: 'app.shortcut-help.togglePanKey',
    description: 'describes the toggle pan shortcut key',
  },
  toggleFullscreenKey: {
    id: 'app.shortcut-help.toggleFullscreenKey',
    description: 'describes the toggle full-screen shortcut key',
  },
  nextSlideKey: {
    id: 'app.shortcut-help.nextSlideKey',
    description: 'describes the next slide shortcut key',
  },
  previousSlideKey: {
    id: 'app.shortcut-help.previousSlideKey',
    description: 'describes the previous slide shortcut key',
  },
});

const ShortcutHelpComponent = (props) => {
  const { intl, shortcuts } = props;
  const { browserName } = browserInfo;
  const { isIos, isMacos } = deviceInfo;

  let accessMod = null;

  // different browsers use different access modifier keys
  // on different systems when using accessKey property.
  // Overview how different browsers behave: https://www.w3schools.com/jsref/prop_html_accesskey.asp
  switch (browserName) {
    case 'Chrome':
    case 'Microsoft Edge':
      accessMod = 'Alt';
      break;
    case 'Firefox':
      accessMod = 'Alt + Shift';
      break;
    default:
      break;
  }

  // all Browsers on iOS are using Control + Alt as access modifier
  if (isIos) {
    accessMod = 'Control + Alt';
  }
  // all Browsers on MacOS are using Control + Option as access modifier
  if (isMacos) {
    accessMod = 'Control + Option';
  }

  const shortcutItems = shortcuts.map((shortcut) => {
    if (!isChatEnabled() && shortcut.descId.indexOf('Chat') !== -1) return null;
    return (
      <tr key={_.uniqueId('hotkey-item-')}>
        <Styled.KeyCell>{`${accessMod} + ${shortcut.accesskey}`}</Styled.KeyCell>
        <Styled.DescCell>{`${intl.formatMessage(intlMessages[`${shortcut.descId.toLowerCase()}`])}`}</Styled.DescCell>
      </tr>
    );
  });

  shortcutItems.push((
    <tr key={_.uniqueId('hotkey-item-')}>
      <Styled.KeyCell>{intl.formatMessage(intlMessages.togglePanKey)}</Styled.KeyCell>
      <Styled.DescCell>{intl.formatMessage(intlMessages.togglePan)}</Styled.DescCell>
    </tr>
  ));

  shortcutItems.push((
    <tr key={_.uniqueId('hotkey-item-')}>
      <Styled.KeyCell>{intl.formatMessage(intlMessages.toggleFullscreenKey)}</Styled.KeyCell>
      <Styled.DescCell>{intl.formatMessage(intlMessages.toggleFullscreen)}</Styled.DescCell>
    </tr>
  ));

  shortcutItems.push((
    <tr key={_.uniqueId('hotkey-item-')}>
      <Styled.KeyCell>{intl.formatMessage(intlMessages.nextSlideKey)}</Styled.KeyCell>
      <Styled.DescCell>{intl.formatMessage(intlMessages.nextSlideDesc)}</Styled.DescCell>
    </tr>
  ));

  shortcutItems.push((
    <tr key={_.uniqueId('hotkey-item-')}>
      <Styled.KeyCell>{intl.formatMessage(intlMessages.previousSlideKey)}</Styled.KeyCell>
      <Styled.DescCell>{intl.formatMessage(intlMessages.previousSlideDesc)}</Styled.DescCell>
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
            <Styled.ShortcutTable>
              <tbody>
                <tr>
                  <th>{intl.formatMessage(intlMessages.comboLabel)}</th>
                  <th>{intl.formatMessage(intlMessages.functionLabel)}</th>
                </tr>
                {shortcutItems}
              </tbody>
            </Styled.ShortcutTable>
          </span>
        )
      }
    </Modal>
  );
};

ShortcutHelpComponent.defaultProps = {
  intl: {},
};

ShortcutHelpComponent.propTypes = {
  intl: PropTypes.object.isRequired,
  shortcuts: PropTypes.arrayOf(PropTypes.shape({
    accesskey: PropTypes.string.isRequired,
    descId: PropTypes.string.isRequired,
  })).isRequired,
};

export default withShortcutHelper(injectIntl(ShortcutHelpComponent));
