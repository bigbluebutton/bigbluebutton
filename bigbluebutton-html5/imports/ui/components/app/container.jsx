import React, { Component, PropTypes, cloneElement } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import App from './component';
import {
  subscribeToCollections,
  wasUserKicked,
  redirectToLogoutUrl,
  getModal,
  getCaptionsStatus,
  showModal,
} from './service';

import NavBarContainer from '../nav-bar/container';
import ActionsBarContainer from '../actions-bar/container';
import MediaContainer from '../media/container';
import ClosedCaptionsContainer from '../closed-captions/container';
import UserListService from '../user-list/service';
import AudioModalContainer  from '/imports/ui/components/audio-modal/container';

import Auth from '/imports/ui/services/auth';

const defaultProps = {
  navbar: <NavBarContainer />,
  actionsbar: <ActionsBarContainer />,
  media: <MediaContainer />,
  captions: <ClosedCaptionsContainer />,
};

class AppContainer extends Component {
  render() {
    // inject location on the navbar container
    let navbarWithLocation = cloneElement(this.props.navbar, { location: this.props.location });

    return (
      <App {...this.props} navbar={navbarWithLocation}>
        {this.props.children}
      </App>
    );
  }
};

const checkUnreadMessages = () => {
  return UserListService.getOpenChats().map(chat=> chat.unreadCounter)
                        .filter(userID => userID !== Auth.userID);
};

const openChats = (chatID) => {
  // get currently opened chatID
  return UserListService.getOpenChats(chatID).map(chat => chat.id);
};

const APP_CONFIG = Meteor.settings.public.app;

const init = () => {
  if (APP_CONFIG.autoJoinAudio) {
    showModal(<AudioModalContainer />);
  }
};

export default createContainer(({ params }) => ({
  init,
  wasKicked: wasUserKicked(),
  modal: getModal(),
  unreadMessageCount: checkUnreadMessages(),
  openChats: openChats(params.chatID),
  openChat: params.chatID,
  getCaptionsStatus,
  redirectToLogoutUrl,
}), AppContainer);

AppContainer.defaultProps = defaultProps;
