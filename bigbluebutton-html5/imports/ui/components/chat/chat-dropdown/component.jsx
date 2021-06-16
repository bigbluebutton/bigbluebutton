import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/modal/service';
import Clipboard from 'clipboard';
import _ from 'lodash';
import Dropdown from '/imports/ui/components/dropdown/component';
import Button from '/imports/ui/components/button/component';

import ChatService from '../service';

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

    this.state = {
      isSettingOpen: false,
    };

    this.onActionsShow = this.onActionsShow.bind(this);
    this.onActionsHide = this.onActionsHide.bind(this);
    this.actionsKey = [
      _.uniqueId('action-item-'),
      _.uniqueId('action-item-'),
      _.uniqueId('action-item-'),
    ];
  }

  componentDidMount() {
    this.clipboard = new Clipboard('#clipboardButton', {
      text: () => '',
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { timeWindowsValues, users, intl } = this.props;
    const { isSettingOpen } = this.state;
    if (prevState.isSettingOpen !== isSettingOpen) {
      this.clipboard = new Clipboard('#clipboardButton', {
        text: () => ChatService.exportChat(timeWindowsValues, users, intl),
      });
    }
  }

  componentWillUnmount() {
    this.clipboard.destroy();
  }

  onActionsShow() {
    this.setState({
      isSettingOpen: true,
    });
  }

  onActionsHide() {
    this.setState({
      isSettingOpen: false,
    });
  }

  getAvailableActions() {
    const {
      intl,
      isMeteorConnected,
      amIModerator,
      meetingIsBreakout,
      meetingName,
      timeWindowsValues,
      users,
    } = this.props;

    const clearIcon = 'delete';
    const saveIcon = 'download';
    const copyIcon = 'copy';
    return _.compact([
      ENABLE_SAVE_AND_COPY_PUBLIC_CHAT
      && (
      <Dropdown.DropdownListItem
        data-test="chatSave"
        icon={saveIcon}
        label={intl.formatMessage(intlMessages.save)}
        key={this.actionsKey[0]}
        onClick={() => {
          const link = document.createElement('a');
          const mimeType = 'text/plain';
          const date = new Date();
          const time = `${date.getHours()}-${date.getMinutes()}`;
          const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${time}`;
          link.setAttribute('download', `bbb-${meetingName}[public-chat]_${dateString}.txt`);
          link.setAttribute(
            'href',
            `data: ${mimeType} ;charset=utf-8,`
            + `${encodeURIComponent(ChatService.exportChat(timeWindowsValues, users, intl))}`,
          );
          link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        }}
      />
      ),
      ENABLE_SAVE_AND_COPY_PUBLIC_CHAT
      && (
      <Dropdown.DropdownListItem
        data-test="chatCopy"
        icon={copyIcon}
        id="clipboardButton"
        label={intl.formatMessage(intlMessages.copy)}
        key={this.actionsKey[1]}
      />
      ),
      !meetingIsBreakout && amIModerator && isMeteorConnected ? (
        <Dropdown.DropdownListItem
          data-test="chatClear"
          icon={clearIcon}
          label={intl.formatMessage(intlMessages.clear)}
          key={this.actionsKey[2]}
          onClick={ChatService.clearPublicChatHistory}
        />
      ) : null,
    ]);
  }

  render() {
    const {
      intl,
      amIModerator,
    } = this.props;
    const { isSettingOpen } = this.state;

    const availableActions = this.getAvailableActions();
    if (!amIModerator && !ENABLE_SAVE_AND_COPY_PUBLIC_CHAT) return null;
    return (
      <Dropdown
        isOpen={isSettingOpen}
        onShow={this.onActionsShow}
        onHide={this.onActionsHide}
      >
        <Dropdown.DropdownTrigger tabIndex={0}>
          <Button
            data-test="chatDropdownTrigger"
            icon="more"
            size="sm"
            ghost
            circle
            hideLabel
            color="dark"
            label={intl.formatMessage(intlMessages.options)}
            aria-label={intl.formatMessage(intlMessages.options)}
            onClick={() => null}
          />
        </Dropdown.DropdownTrigger>
        <Dropdown.DropdownContent placement="bottom right">
          <Dropdown.DropdownList>{availableActions}</Dropdown.DropdownList>
        </Dropdown.DropdownContent>
      </Dropdown>
    );
  }
}

export default withModalMounter(injectIntl(ChatDropdown));
