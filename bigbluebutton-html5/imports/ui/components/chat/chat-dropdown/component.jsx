import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import _ from 'lodash';
import BBBMenu from '/imports/ui/components/common/menu/component';
import { getDateString } from '/imports/utils/string-utils';
import Trigger from '/imports/ui/components/common/control-header/right/component';

import ChatService from '../service';
import { addNewAlert } from '../../screenreader-alert/service';

const intlMessages = defineMessages({
  clear: {
    id: 'app.chat.dropdown.clear',
    description: 'Clear button label',
  },
  save: {
    id: 'app.chat.dropdown.save',
    description: 'Clear button label',
  },
  copy: {
    id: 'app.chat.dropdown.copy',
    description: 'Copy button label',
  },
  copySuccess: {
    id: 'app.chat.copySuccess',
    description: 'aria success alert',
  },
  copyErr: {
    id: 'app.chat.copyErr',
    description: 'aria error alert',
  },
  options: {
    id: 'app.chat.dropdown.options',
    description: 'Chat Options',
  },
});

const CHAT_CONFIG = Meteor.settings.public.chat;
const ENABLE_SAVE_AND_COPY_PUBLIC_CHAT = CHAT_CONFIG.enableSaveAndCopyPublicChat;

class ChatDropdown extends PureComponent {
  constructor(props) {
    super(props);

    this.actionsKey = [
      _.uniqueId('action-item-'),
      _.uniqueId('action-item-'),
      _.uniqueId('action-item-'),
    ];
  }

  getAvailableActions() {
    const {
      intl,
      isMeteorConnected,
      amIModerator,
      meetingIsBreakout,
      meetingName,
      timeWindowsValues,
    } = this.props;

    const clearIcon = 'delete';
    const saveIcon = 'download';
    const copyIcon = 'copy';

    this.menuItems = [];

    if (ENABLE_SAVE_AND_COPY_PUBLIC_CHAT) {
      this.menuItems.push(
        {
          key: this.actionsKey[0],
          icon: saveIcon,
          dataTest: 'chatSave',
          label: intl.formatMessage(intlMessages.save),
          onClick: () => {
            const link = document.createElement('a');
            const mimeType = 'text/plain';
            link.setAttribute('download', `bbb-${meetingName}[public-chat]_${getDateString()}.txt`);
            link.setAttribute(
              'href',
              `data: ${mimeType};charset=utf-8,`
              + `${encodeURIComponent(ChatService.exportChat(timeWindowsValues, intl))}`,
            );
            link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          },
        },
      );
    }

    if (ENABLE_SAVE_AND_COPY_PUBLIC_CHAT) {
      this.menuItems.push(
        {
          key: this.actionsKey[1],
          icon: copyIcon,
          id: 'clipboardButton',
          dataTest: 'chatCopy',
          label: intl.formatMessage(intlMessages.copy),
          onClick: () => {
            const chatHistory = ChatService.exportChat(timeWindowsValues, intl);
            navigator.clipboard.writeText(chatHistory).then(() => {
              addNewAlert(intl.formatMessage(intlMessages.copySuccess));
            }).catch(() => {
              addNewAlert(intl.formatMessage(intlMessages.copyErr));
            });
          },
        },
      );
    }

    if (!meetingIsBreakout && amIModerator && isMeteorConnected) {
      this.menuItems.push(
        {
          key: this.actionsKey[2],
          icon: clearIcon,
          dataTest: 'chatClear',
          label: intl.formatMessage(intlMessages.clear),
          onClick: () => ChatService.clearPublicChatHistory(),
        },
      );
    }

    return this.menuItems;
  }

  render() {
    const {
      intl,
      amIModerator,
      isRTL,
    } = this.props;

    if (!amIModerator && !ENABLE_SAVE_AND_COPY_PUBLIC_CHAT) return null;
    return (
      <>
        <BBBMenu
          trigger={
            <Trigger
              data-test="chatOptionsMenu"
              icon="more"
              label={intl.formatMessage(intlMessages.options)}
              aria-label={intl.formatMessage(intlMessages.options)}
              onClick={() => null}
            />                    
          }
          opts={{
            id: 'chat-options-dropdown-menu',
            keepMounted: true,
            transitionDuration: 0,
            elevation: 3,
            getContentAnchorEl: null,
            fullwidth: 'true',
            anchorOrigin: { vertical: 'bottom', horizontal: isRTL ? 'right' : 'left' },
            transformOrigin: { vertical: 'top', horizontal: isRTL ? 'right' : 'left' },
          }}
          actions={this.getAvailableActions()}
        />
      </>
    );
  }
}

export default withModalMounter(injectIntl(ChatDropdown));
