import React, { Component } from 'react';
import { Session } from 'meteor/session';
import PropTypes from 'prop-types';
import Auth from '/imports/ui/services/auth';
import { setCustomLogoUrl } from '/imports/ui/components/user-list/service';
import { makeCall } from '/imports/ui/services/api';
import deviceInfo from '/imports/utils/deviceInfo';
import logger from '/imports/startup/client/logger';
import LoadingScreen from '/imports/ui/components/loading-screen/component';

const propTypes = {
  children: PropTypes.element.isRequired,
};

const APP_CONFIG = Meteor.settings.public.app;
const { showParticipantsOnLogin } = APP_CONFIG;
const CHAT_ENABLED = Meteor.settings.public.chat.enabled;

class JoinHandler extends Component {
  static setError(codeError) {
    Session.set('hasError', true);
    if (codeError) Session.set('codeError', codeError);
  }

  constructor(props) {
    super(props);
    this.fetchToken = this.fetchToken.bind(this);
    this.numFetchTokenRetries = 0;

    this.state = {
      joined: false,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetchToken();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  async fetchToken() {
    if (!this._isMounted) return;

    if (!Meteor.status().connected) {
      if (this.numFetchTokenRetries % 9) {
        logger.error({
          logCode: 'joinhandler_component_fetchToken_not_connected',
          extraInfo: {
            numFetchTokenRetries: this.numFetchTokenRetries,
          },
        }, 'Meteor was not connected, retry in a few moments');
      }
      this.numFetchTokenRetries += 1;

      setTimeout(() => this.fetchToken(), 200);
      return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const sessionToken = urlParams.get('sessionToken');

    if (!sessionToken) {
      JoinHandler.setError('400');
      Session.set('errorMessageDescription', 'Session token was not provided');
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

      logger.info({
        logCode: 'joinhandler_component_clientinfo',
        extraInfo: { clientInfo },
      },
      'Log information about the client');
    };

    const setAuth = (resp) => {
      const {
        meetingID, internalUserID, authToken, logoutUrl,
        fullname, externUserID, confname,
      } = resp;
      return new Promise((resolve) => {
        Auth.set(
          meetingID, internalUserID, authToken, logoutUrl,
          sessionToken, fullname, externUserID, confname,
        );
        resolve(resp);
      });
    };

    const setLogoutURL = (url) => {
      Auth.logoutURL = url;
      return true;
    };

    const setLogoURL = (resp) => {
      setCustomLogoUrl(resp.customLogoURL);
      return resp;
    };

    const setCustomData = (resp) => {
      const {
        meetingID, internalUserID, customdata,
      } = resp;

      return new Promise((resolve) => {
        if (customdata.length) {
          makeCall('addUserSettings', meetingID, internalUserID, customdata).then(r => resolve(r));
        }
        resolve(true);
      });
    };

    const setBannerProps = (resp) => {
      Session.set('bannerText', resp.bannerText);
      Session.set('bannerColor', resp.bannerColor);
    };

    // use enter api to get params for the client
    const url = `/bigbluebutton/api/enter?sessionToken=${sessionToken}`;
    const fetchContent = await fetch(url, { credentials: 'same-origin' });
    const parseToJson = await fetchContent.json();
    const { response } = parseToJson;

    setLogoutURL(response);

    if (response.returncode !== 'FAILED') {
      await setAuth(response);
      await setCustomData(response);

      setBannerProps(response);
      setLogoURL(response);
      logUserInfo();

      if (showParticipantsOnLogin && !deviceInfo.type().isPhone) {
        Session.set('openPanel', 'userlist');
        if (CHAT_ENABLED) {
          Session.set('openPanel', 'chat');
          Session.set('idChatOpen', '');
        }
      } else {
        Session.set('openPanel', '');
      }

      logger.info({
        logCode: 'joinhandler_component_joinroutehandler_success',
        extraInfo: {
          response,
        },
      }, 'User successfully went through main.joinRouteHandler');
    } else {
      const e = new Error(response.message);
      if (!Session.get('codeError')) Session.set('errorMessageDescription', response.message);
      logger.error({
        logCode: 'joinhandler_component_joinroutehandler_error',
        extraInfo: {
          response,
          error: e,
        },
      }, 'User faced an error on main.joinRouteHandler.');
    }
    this.setState({ joined: true });
  }

  render() {
    const { children } = this.props;
    const { joined } = this.state;
    return joined
      ? children
      : (<LoadingScreen />);
  }
}

export default JoinHandler;

JoinHandler.propTypes = propTypes;
