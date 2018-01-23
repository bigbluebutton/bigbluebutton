import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/modal/service';
import Clipboard from 'clipboard';
import _ from 'lodash';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import Auth from '/imports/ui/services/auth';
import Acl from '/imports/startup/acl';
import Button from '/imports/ui/components/button/component';

import ChatService from './../service';
import { styles } from './styles';

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

class ChatDropdown extends Component {
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
      text: () => ChatService.exportChat(ChatService.getPublicMessages()),
    });
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
    const { intl } = this.props;

    const clearIcon = 'delete';
    const saveIcon = 'save_notes';
    const copyIcon = 'copy';

    return _.compact([
      <DropdownListItem
        icon={saveIcon}
        label={intl.formatMessage(intlMessages.save)}
        key={this.actionsKey[0]}
        onClick={() => {
          const link = document.createElement('a');
          const mimeType = 'text/plain';

          link.setAttribute('download', `public-chat-${Date.now()}.txt`);
          link.setAttribute(
            'href',
            `data: ${mimeType} ;charset=utf-8,
            ${encodeURIComponent(ChatService.exportChat(ChatService.getPublicMessages()))}`,
          );
          link.click();
        }}
      />,
      <DropdownListItem
        icon={copyIcon}
        id="clipboardButton"
        label={intl.formatMessage(intlMessages.copy)}
        key={this.actionsKey[1]}
      />,
      Acl.can('methods.clearPublicChatHistory', Auth.credentials) ? (
        <DropdownListItem
          icon={clearIcon}
          label={intl.formatMessage(intlMessages.clear)}
          key={this.actionsKey[2]}
          onClick={ChatService.clearPublicChatHistory}
        />
      ) : null,
    ]);
  }

  render() {
    const { intl } = this.props;

    const availableActions = this.getAvailableActions();

    return (
      <Dropdown
        isOpen={this.state.isSettingOpen}
        onShow={this.onActionsShow}
        onHide={this.onActionsHide}
      >
        <DropdownTrigger tabIndex={0}>
          <Button
            data-test="chatDropdownTrigger"
            className={styles.btn}
            icon="more"
            ghost
            circle
            hideLabel
            color="primary"
            label={intl.formatMessage(intlMessages.options)}
            aria-label={intl.formatMessage(intlMessages.options)}
            onClick={() => null}
          />
        </DropdownTrigger>
        <DropdownContent placement="bottom right">
          <DropdownList>{availableActions}</DropdownList>
        </DropdownContent>
      </Dropdown>
    );
  }
}

export default withModalMounter(injectIntl(ChatDropdown));
