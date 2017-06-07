import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import _ from 'lodash';

import Auth from '/imports/ui/services/auth';
import UserListService from '/imports/ui/components/user-list/service';
import Settings from '/imports/ui/services/settings';

class ChatNotificationContainer extends Component {
  constructor(props) {
    super(props);

    this.audio = new Audio('/html5client/resources/sounds/notify.mp3');
  }

  playAudio() {
    if (this.props.disableAudio) return;
    return _.debounce(() => this.audio.play(), this.audio.duration * 1000)();
  }

  componentDidUpdate(prevProps) {
    if (this.props.unreadMessagesCount > prevProps.unreadMessagesCount) {
      this.playAudio();
    }
  }

  render() {
    return null;
  }
}

export default createContainer(({ currentChatID }) => {
  const AppSettings = Settings.application;

  const unreadMessagesCount = UserListService.getOpenChats()
                        .map(chat => chat.unreadCounter)
                        .filter(userID => userID !== Auth.userID)
                        .reduce((a, b) => a + b, 0);

  return {
    disableAudio: !AppSettings.chatAudioNotifications,
    unreadMessagesCount,
  };
}, ChatNotificationContainer);
