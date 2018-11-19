import React, { Component } from 'react';
import { Session } from 'meteor/session'; 
import Auth from '/imports/ui/services/auth';
import { setCustomLogoUrl } from '/imports/ui/components/user-list/service';
import { makeCall } from '/imports/ui/services/api';
import deviceInfo from '/imports/utils/deviceInfo';
import logger from '/imports/startup/client/logger';
import LoadingScreen from '/imports/ui/components/loading-screen/component';


class JoinHandler extends Component {
  static setError(codeError) {
    Session.set('hasError', true);
    if (codeError) Session.set('codeError', codeError);
  }
  constructor(props) {
    super(props);
    this.fetchToken = this.fetchToken.bind(this);
    this.changeToJoin = this.changeToJoin.bind(this);

    this.state = {
      joined: false,
    };
  }

  componentDidMount() {
    this.fetchToken();
  }

  changeToJoin(bool) {
    this.setState({ joined: bool });
  }

  fetchToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionToken = urlParams.get('sessionToken');
    if (!sessionToken) {
      JoinHandler.setError('404');
    }

    // Old credentials stored in memory were being used when joining a new meeting
    Auth.clearCredentials();
    const logUserInfo = () => {
      const userInfo = window.navigator;

      // Browser information is sent once on startup
      // Sent here instead of Meteor.startup, as the
      // user might not be validated by then, thus user's data
      // would not be sent with this information
      const clientInfo = {
        language: userInfo.language,
        userAgent: userInfo.userAgent,
        screenSize: { width: window.screen.width, height: window.screen.height },
        windowSize: { width: window.innerWidth, height: window.innerHeight },
        bbbVersion: Meteor.settings.public.app.bbbServerVersion,
        location: window.location.href,
      };

      logger.info(clientInfo);
    };

    const setAuth = (resp) => {
      const {
        meetingID, internalUserID, authToken, logoutUrl,
        fullname, externUserID, confname,
      } = resp;
      Auth.set(
        meetingID, internalUserID, authToken, logoutUrl,
        sessionToken, fullname, externUserID, confname,
      );
      return resp;
    };

    const setLogoURL = (resp) => {
      setCustomLogoUrl(resp.customLogoURL);
      return resp;
    };

    const setCustomData = (resp) => {
      const {
        meetingID, internalUserID, customdata,
      } = resp;

      if (customdata.length) {
        makeCall('addUserSettings', meetingID, internalUserID, customdata);
      }
      return resp;
    };
    // use enter api to get params for the client
    const url = `/bigbluebutton/api/enter?sessionToken=${sessionToken}`;

    const validAuth = new Promise((resolve, reject) => {
      fetch(url, { credentials: 'same-origin' })
        .then(response => response.json())
        .then(({ response }) => response)
        .then((resp) => {
          if (resp.returncode !== 'FAILED') {
            logger.info(`User successfully went through main.joinRouteHandler with [${resp}].`);
            return resolve(resp);
          }
          const e = new Error('Session not found');
          logger.error(`User faced [${e}] on main.joinRouteHandler. Error was:`, JSON.stringify(resp));
          return reject(e);
        });
    });

    validAuth
      .then(setCustomData)
      .then(setAuth)
      .then(setLogoURL)
      .then(logUserInfo)
      .then(() => Session.set('isUserListOpen', deviceInfo.type().isPhone))
      .finally(() => this.changeToJoin(true));
  }

  render() {
    const { children } = this.props;
    const { joined } = this.state;
    return joined ?
      children :
      (<LoadingScreen />);
  }
}

export default JoinHandler;
