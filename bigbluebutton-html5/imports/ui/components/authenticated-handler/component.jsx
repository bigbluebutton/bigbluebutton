import React, { Component } from 'react';
import { Session } from 'meteor/session';
import { log } from '/imports/ui/services/api';
import Auth from '/imports/ui/services/auth';
import LoadingScreen from '/imports/ui/components/loading-screen/component';

const STATUS_CONNECTING = 'connecting';
const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_ID = CHAT_CONFIG.public_id;

class AuthenticatedHandler extends Component {
  static setError(codeError) {
    Session.set('hasError', true);
    if (codeError) Session.set('codeError', codeError);
  }

  static shouldAuthenticate(status, lastStatus) {
    return lastStatus != null && lastStatus === STATUS_CONNECTING && status.connected;
  }

  static updateStatus(status, lastStatus) {
    return status.retryCount > 0 && lastStatus !== STATUS_CONNECTING ? status.status : lastStatus;
  }

  static addReconnectObservable() {
    let lastStatus = null;

    Tracker.autorun(() => {
      lastStatus = AuthenticatedHandler.updateStatus(Meteor.status(), lastStatus);

      if (AuthenticatedHandler.shouldAuthenticate(Meteor.status(), lastStatus)) {
        Auth.authenticate(true);
        lastStatus = Meteor.status().status;
      }
    });
  }

  static async authenticatedRouteHandler(callback) {
    if (Auth.loggedIn) {
      callback();
    }

    AuthenticatedHandler.addReconnectObservable();

    const setReason = (reason) => {
      log('error', reason);
      AuthenticatedHandler.setError(reason.error);
      callback();
    };

    try {
      const getAuthenticate = await Auth.authenticate();
      callback(getAuthenticate);
    } catch (error) {
      setReason(error);
    }
  }

  constructor(props) {
    super(props);
    this.changeState = this.changeState.bind(this);
    this.state = {
      authenticated: false,
    };
  }

  componentDidMount() {
    if (Session.get('codeError')) return this.changeState(true);
    AuthenticatedHandler.authenticatedRouteHandler((value, error) => {
      if (error) AuthenticatedHandler.setError(error);
      this.changeState(true);
    });
  }

  changeState(state) {
    this.setState({ authenticated: state });
  }

  render() {
    const {
      children,
    } = this.props;
    const {
      authenticated,
    } = this.state;

    Session.set('isChatOpen', false);
    Session.set('idChatOpen', PUBLIC_CHAT_ID);
    Session.set('isMeetingEnded', false);
    Session.set('isPollOpen', false);
    Session.set('breakoutRoomIsOpen', false);

    return authenticated
      ? children
      : (<LoadingScreen />);
  }
}


export default AuthenticatedHandler;
