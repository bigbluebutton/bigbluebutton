import React, { Component } from 'react';
import { Session } from 'meteor/session';
import logger from '/imports/startup/client/logger';
import Auth from '/imports/ui/services/auth';
import LoadingScreen from '/imports/ui/components/loading-screen/component';

const STATUS_CONNECTING = 'connecting';

class AuthenticatedHandler extends Component {
  static setError({ description, error }) {
    if (error) Session.set('codeError', error);
    Session.set('errorMessageDescription', description);
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
      logger.error({
        logCode: 'authenticatedhandlercomponent_setreason',
        extraInfo: { reason },
      }, 'Encountered error while trying to authenticate');

      AuthenticatedHandler.setError(reason);
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
    this.state = {
      authenticated: false,
    };
  }

  componentDidMount() {
    if (Session.get('codeError')) {
      this.setState({ authenticated: true });
    }
    AuthenticatedHandler.authenticatedRouteHandler((value, error) => {
      if (error) AuthenticatedHandler.setError(error);
      this.setState({ authenticated: true });
    });
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

    return authenticated
      ? children
      : (<LoadingScreen />);
  }
}


export default AuthenticatedHandler;
