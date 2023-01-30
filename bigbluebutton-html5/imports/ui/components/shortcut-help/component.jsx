import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import browserInfo from '/imports/utils/browserInfo';
import deviceInfo from '/imports/utils/deviceInfo';
import Modal from '/imports/ui/components/common/modal/simple/component';
import _ from 'lodash';
import Styled from './styles';
import StyledSettings from '../settings/styles';
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
  select: {
    id: 'app.shortcut-help.select',
    description: 'describes the selection tool shortcut key',
  },
  pencil: {
    id: 'app.shortcut-help.pencil',
    description: 'describes the pencil tool shortcut key',
  },
  eraser: {
    id: 'app.shortcut-help.eraser',
    description: 'describes the eraser tool shortcut key',
  },
  rectangle: {
    id: 'app.shortcut-help.rectangle',
    description: 'describes the rectangle shape tool shortcut key',
  },
  elipse: {
    id: 'app.shortcut-help.elipse',
    description: 'describes the elipse shape tool shortcut key',
  },
  triangle: {
    id: 'app.shortcut-help.triangle',
    description: 'describes the triangle shape tool shortcut key',
  },
  line: {
    id: 'app.shortcut-help.line',
    description: 'describes the line shape tool shortcut key',
  },
  arrow: {
    id: 'app.shortcut-help.arrow',
    description: 'describes the arrow shape tool shortcut key',
  },
  text: {
    id: 'app.shortcut-help.text',
    description: 'describes the text tool shortcut key',
  },
  note: {
    id: 'app.shortcut-help.note',
    description: 'describes the sticky note shortcut key',
  },
  general: {
    id: 'app.shortcut-help.general',
    description: 'general tab heading',
  },
  presentation: {
    id: 'app.shortcut-help.presentation',
    description: 'presentation tab heading',
  },
  whiteboard: {
    id: 'app.shortcut-help.whiteboard',
    description: 'whiteboard tab heading',
  },
  zoomIn: {
    id: 'app.shortcut-help.zoomIn',
    description: 'describes the zoom in shortcut key',
  },
  zoomOut: {
    id: 'app.shortcut-help.zoomOut',
    description: 'describes the zoom out shortcut key',
  },
  zoomFit: {
    id: 'app.shortcut-help.zoomFit',
    description: 'describes the zoom to fit shortcut key',
  },
  zoomSelect: {
    id: 'app.shortcut-help.zoomSelect',
    description: 'describes the zoom to selection shortcut key',
  },
  flipH: {
    id: 'app.shortcut-help.flipH',
    description: 'describes the flip horozontally shortcut key',
  },
  flipV: {
    id: 'app.shortcut-help.flipV',
    description: 'describes the flip vertically shortcut key',
  },
  lock: {
    id: 'app.shortcut-help.lock',
    description: 'describes the lock / unlock shape shortcut key',
  },
  moveToFront: {
    id: 'app.shortcut-help.moveToFront',
    description: 'describes the move to front shortcut key',
  },
  moveToBack: {
    id: 'app.shortcut-help.moveToBack',
    description: 'describes the move to back shortcut key',
  },
  moveForward: {
    id: 'app.shortcut-help.moveForward',
    description: 'describes the move forward shortcut key',
  },
  moveBackward: {
    id: 'app.shortcut-help.moveBackward',
    description: 'describes the move backward shortcut key',
  },
  undo: {
    id: 'app.shortcut-help.undo',
    description: 'describes the undo shortcut key',
  },
  redo: {
    id: 'app.shortcut-help.redo',
    description: 'describes the redo shortcut key',
  },
  cut: {
    id: 'app.shortcut-help.cut',
    description: 'describes the cut shortcut key',
  },
  copy: {
    id: 'app.shortcut-help.copy',
    description: 'describes the cut shortcut key',
  },
  paste: {
    id: 'app.shortcut-help.paste',
    description: 'describes the paste shortcut key',
  },
  selectAll: {
    id: 'app.shortcut-help.selectAll',
    description: 'describes the select all shortcut key',
  },
  delete: {
    id: 'app.shortcut-help.delete',
    description: 'describes the delete shortcut key',
  },
  duplicate: {
    id: 'app.shortcut-help.duplicate',
    description: 'describes the duplicate shortcut key',
  }
});


const renderItem = (func, key) => {
  return (
    <tr key={_.uniqueId('hotkey-item-')}>
      <Styled.DescCell>{func}</Styled.DescCell>
      <Styled.KeyCell>{key}</Styled.KeyCell>
    </tr>
  );
}

const ShortcutHelpComponent = (props) => {
  const { intl, shortcuts } = props;
  const { browserName } = browserInfo;
  const { isIos, isMacos } = deviceInfo;
  const [ selectedTab, setSelectedTab] = React.useState(0);

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

  const generalShortcutItems = shortcuts.map((shortcut) => {
    if (!isChatEnabled() && shortcut.descId.indexOf('Chat') !== -1) return null;
    return renderItem(
      `${intl.formatMessage(intlMessages[`${shortcut.descId.toLowerCase()}`])}`,
      `${accessMod} + ${shortcut.accesskey}`
    );
  });

  const shortcutItems = [];
  shortcutItems.push(renderItem(intl.formatMessage(intlMessages.togglePan), intl.formatMessage(intlMessages.togglePanKey)));
  shortcutItems.push(renderItem(intl.formatMessage(intlMessages.toggleFullscreen), intl.formatMessage(intlMessages.toggleFullscreenKey)));
  shortcutItems.push(renderItem(intl.formatMessage(intlMessages.nextSlideDesc), intl.formatMessage(intlMessages.nextSlideKey)));
  shortcutItems.push(renderItem(intl.formatMessage(intlMessages.previousSlideDesc), intl.formatMessage(intlMessages.previousSlideKey)));

  const whiteboardShortcutItems = [];
  //tools
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.select), '1'));
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.pencil), '2'));
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.eraser), '3'));
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.rectangle), '4'));
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.elipse), '5'));
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.triangle), '6'));
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.line), '7'));
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.arrow), '8'));
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.text), '9'));
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.note), '0'));
  //views
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.zoomIn), 'Ctrl +'));
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.zoomOut), 'Ctrl -'));
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.zoomFit), 'Shift 1'));
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.zoomSelect), 'Shift 2'));
//transform
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.flipH), 'Shift H'));
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.flipV), 'Shift V'));
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.lock), 'Ctrl Shift L'));
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.moveToFront), 'Shift ]'));
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.moveForward), ']'));
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.moveBackward), '['));
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.moveToBack), 'Shift ['));
  //edit
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.undo), 'Ctrl Z'));
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.redo), 'Ctrl Shift Z'));
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.cut), 'Ctrl X'));
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.copy), 'Ctrl C'));
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.paste), 'Ctrl V'));
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.selectAll), 'Ctrl A'));
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.delete), 'Del'));
  whiteboardShortcutItems.push(renderItem(intl.formatMessage(intlMessages.duplicate), 'Ctrl D'));

  return (
    <Modal
      contentLabel={intl.formatMessage(intlMessages.title)}
      dismiss={{
        label: intl.formatMessage(intlMessages.closeLabel),
        description: intl.formatMessage(intlMessages.closeDesc),
      }}
      title={intl.formatMessage(intlMessages.title)}
    >
      <Styled.SettingsTabs
        onSelect={(tab) => setSelectedTab(tab)}
        selectedIndex={selectedTab}
        role="presentation"
      >
        <StyledSettings.SettingsTabList>
          <StyledSettings.SettingsTabSelector selectedClassName="is-selected">
            <StyledSettings.SettingsIcon iconName="application" />
            <span id="appicationTab">{intl.formatMessage(intlMessages.general)}</span>
          </StyledSettings.SettingsTabSelector>

          <StyledSettings.SettingsTabSelector selectedClassName="is-selected">
            <StyledSettings.SettingsIcon iconName="presentation" />
            <span id="presentationTab">{intl.formatMessage(intlMessages.presentation)}</span>
          </StyledSettings.SettingsTabSelector>

          <StyledSettings.SettingsTabSelector selectedClassName="is-selected">
            <StyledSettings.SettingsIcon iconName="whiteboard" />
            <span id="whiteboardTab">{intl.formatMessage(intlMessages.whiteboard)}</span>
          </StyledSettings.SettingsTabSelector>
        </StyledSettings.SettingsTabList>

        <Styled.TabPanel selectedClassName="is-selected">
        {!accessMod ? <p>{intl.formatMessage(intlMessages.accessKeyNotAvailable)}</p>
          : (
            <Styled.TableWrapper>
              <Styled.ShortcutTable>
                <tbody>
                  <tr>           
                    <th>{intl.formatMessage(intlMessages.functionLabel)}</th>
                    <th>{intl.formatMessage(intlMessages.comboLabel)}</th>
                  </tr>
                  {generalShortcutItems}
                </tbody>
              </Styled.ShortcutTable>
            </Styled.TableWrapper>
          )
        }
        </Styled.TabPanel>
        <Styled.TabPanel selectedClassName="is-selected">
          <Styled.TableWrapper>
            <Styled.ShortcutTable>
              <tbody>
                <tr>
                  <th>{intl.formatMessage(intlMessages.functionLabel)}</th>
                  <th>{intl.formatMessage(intlMessages.comboLabel)}</th>
                </tr>
                {shortcutItems}
              </tbody>
            </Styled.ShortcutTable>
          </Styled.TableWrapper>
        </Styled.TabPanel>
        <Styled.TabPanel selectedClassName="is-selected">
          <Styled.TableWrapper>
            <Styled.ShortcutTable>
              <tbody>
                <tr>
                  <th>{intl.formatMessage(intlMessages.functionLabel)}</th>
                  <th>{intl.formatMessage(intlMessages.comboLabel)}</th>
                </tr>
                {whiteboardShortcutItems}
              </tbody>
            </Styled.ShortcutTable>
          </Styled.TableWrapper>
        </Styled.TabPanel>

      </Styled.SettingsTabs>
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
