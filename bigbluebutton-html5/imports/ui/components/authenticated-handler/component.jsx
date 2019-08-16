import React, { Component } from 'react';
import { Session } from 'meteor/session';
import logger from '/imports/startup/client/logger';
import Auth from '/imports/ui/services/auth';
import { withJoinLoadingConsumer } from '/imports/ui/components/join-loading/context/context';

const STATUS_CONNECTING = 'connecting';
const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_ID = CHAT_CONFIG.public_id;

class AuthenticatedHandler extends Component {
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

  constructor(props) {
    super(props);
    this.setError = this.setError.bind(this);
    this.authenticatedRouteHandler = this.authenticatedRouteHandler.bind(this);
    this.state = {
      authenticated: false,
    };
  }

  componentDidMount() {
    if (Session.get('codeError')) {
      return this.setError(Session.get('codeError'));
    }
    return this.authenticatedRouteHandler((value, error) => {
      if (error) return this.setError(error);
      return this.setState({ authenticated: true });
    });
  }

  setError(codeError) {
    const { dispatch } = this.props;
    Session.set('hasError', true);
    dispatch('hasError');
    if (codeError) Session.set('codeError', codeError);
  }

  async authenticatedRouteHandler(callback) {
    if (Auth.loggedIn) {
      callback();
    }

    AuthenticatedHandler.addReconnectObservable();

    const setReason = (reason) => {
      this.setError(reason.error);
      logger.error({
        logCode: 'authenticatedhandlercomponent_setreason',
        extraInfo: { reason },
      }, 'Encountered error while trying to authenticate');

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

    return authenticated && children;
  }
}


export default withJoinLoadingConsumer(AuthenticatedHandler);
