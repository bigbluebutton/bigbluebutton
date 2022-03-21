import React, { Component, useContext } from 'react';
import { Session } from 'meteor/session';
import logger from '/imports/startup/client/logger';
import Auth from '/imports/ui/services/auth';
import { JoinContext, JOIN_ACTIONS } from '/imports/ui/components/components-data/join-context/context';

const STATUS_CONNECTING = 'connecting';

class AuthenticatedHandler extends Component {
  static shouldAuthenticate(status, lastStatus) {
    return lastStatus != null && lastStatus === STATUS_CONNECTING && status.connected;
  }

  static updateStatus(status, lastStatus) {
    return lastStatus !== STATUS_CONNECTING ? status.status : lastStatus;
  }

  static addReconnectObservable() {
    let lastStatus = null;

    Tracker.autorun(() => {
      lastStatus = AuthenticatedHandler.updateStatus(Meteor.status(), lastStatus);

      if (AuthenticatedHandler.shouldAuthenticate(Meteor.status(), lastStatus)) {
        Session.set('userWillAuth', true);
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
      this.setState({ authenticated: true });
    }
    this.authenticatedRouteHandler((value, error) => {
      if (error) this.setError(error.description, error.code);
      this.setState({ authenticated: true });
    });
  }

  setError(description, error) {
    const { joinDispatch } = this.props;
    console.log('set erro auth', { description, error });
    if (error) Session.set('codeError', error);
    Session.set('errorMessageDescription', description);

    joinDispatch({
      type: JOIN_ACTIONS.SET_HAS_ERROR,
      value: true,
    });
  }

  async authenticatedRouteHandler(callback) {
    if (Auth.loggedIn) {
      callback();
    }

    AuthenticatedHandler.addReconnectObservable();

    const setReason = (reason) => {
      const log = reason.error === 403 ? 'warn' : 'error';

      logger[log]({
        logCode: 'authenticatedhandlercomponent_setreason',
        extraInfo: { reason },
      }, 'Encountered error while trying to authenticate');

      this.setError(reason.description, reason.error);
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

    Session.set('isMeetingEnded', false);
    Session.set('isPollOpen', false);
    // TODO: breakoutRoomIsOpen doesn't seem used
    Session.set('breakoutRoomIsOpen', false);

    return authenticated && children;
  }
}

const AuthenticatedHandlerContainer = (props) => {
  const usingJoinContext = useContext(JoinContext);
  const { joinDispatch } = usingJoinContext;

  return <AuthenticatedHandler {...{ joinDispatch, ...props }} />;
};

export default AuthenticatedHandlerContainer;
