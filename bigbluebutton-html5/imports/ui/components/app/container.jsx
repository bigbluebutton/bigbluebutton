import React, { Component, PropTypes, cloneElement } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import App from './component';
import {
  subscribeForData,
  wasUserKicked,
  redirectToLogoutUrl,
  getModal,
} from './service';

import NavBarContainer from '../nav-bar/container';
import ActionsBarContainer from '../actions-bar/container';
import MediaContainer from '../media/container';
import ClosedCaptionsContainer from '../closed-captions/container';
import userListService from '../user-list/service';
import Auth from '/imports/ui/services/auth';
import ChatService from '../chat/service';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_KEY = CHAT_CONFIG.public_id;

const defaultProps = {
  navbar: <NavBarContainer />,
  actionsbar: <ActionsBarContainer />,
  media: <MediaContainer />,

  //CCs UI is commented till the next pull request
  //captions: <ClosedCaptionsContainer />,
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
}

let loading = true;
const loadingDep = new Tracker.Dependency;

const getLoading = () => {
  loadingDep.depend();
  return loading;
};

const setLoading = (val) => {
  if (val !== loading) {
    loading = val;
    loadingDep.changed();
  }
};

const checkUnreadMessages = () => {
  let users = userListService.getUsers();
  return users
     .map(user => user.id)
     .filter(userID => userID !== Auth.userID)
     .concat(PUBLIC_CHAT_KEY)
     .some(receiverID => ChatService.hasUnreadMessages(receiverID));
};

export default createContainer(() => {
  Promise.all(subscribeForData())
  .then(() => {
    setLoading(false);
  });

  return {
    wasKicked: wasUserKicked(),
    isLoading: getLoading(),
    modal: getModal(),
    hasUnreadMessages: checkUnreadMessages(),
    redirectToLogoutUrl,
  };
}, AppContainer);

AppContainer.defaultProps = defaultProps;
