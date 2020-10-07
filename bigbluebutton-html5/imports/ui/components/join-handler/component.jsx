import React, { Component } from 'react';
import { Session } from 'meteor/session';
import PropTypes from 'prop-types';
import SanitizeHTML from 'sanitize-html';
import Auth from '/imports/ui/services/auth';
import { setCustomLogoUrl, setModeratorOnlyMessage } from '/imports/ui/components/user-list/service';
import { makeCall } from '/imports/ui/services/api';
import logger from '/imports/startup/client/logger';
import LoadingScreen from '/imports/ui/components/loading-screen/component';
import Users from '/imports/api/users';

const propTypes = {
  children: PropTypes.element.isRequired,
};

class JoinHandler extends Component {
  static setError(codeError) {
    if (codeError) Session.set('codeError', codeError);
  }

  constructor(props) {
    super(props);
    this.fetchToken = this.fetchToken.bind(this);

    this.state = {
      joined: false,
    };
  }

  componentDidMount() {
    this._isMounted = true;

    if (!this.firstJoinTime) {
      this.firstJoinTime = new Date();
    }
    Tracker.autorun((c) => {
      const {
        connected,
        status,
      } = Meteor.status();

      logger.debug(`Initial connection status change. status: ${status}, connected: ${connected}`);
      if (connected) {
        c.stop();

        const msToConnect = (new Date() - this.firstJoinTime) / 1000;
        const secondsToConnect = parseFloat(msToConnect).toFixed(2);

        logger.info({
          logCode: 'joinhandler_component_initial_connection_time',
          extraInfo: {
            attemptForUserInfo: Auth.fullInfo,
            timeToConnect: secondsToConnect,
          },
        }, `Connection to Meteor took ${secondsToConnect}s`);

        this.firstJoinTime = undefined;
        this.fetchToken();
      } else if (status === 'failed') {
        c.stop();

        const msToConnect = (new Date() - this.firstJoinTime) / 1000;
        const secondsToConnect = parseFloat(msToConnect).toFixed(2);
        logger.info({
          logCode: 'joinhandler_component_initial_connection_failed',
          extraInfo: {
            attemptForUserInfo: Auth.fullInfo,
            timeToConnect: secondsToConnect,
          },
        }, `Connection to Meteor failed, took ${secondsToConnect}s`);

        JoinHandler.setError('400');
        Session.set('errorMessageDescription', 'Failed to connect to server');
        this.firstJoinTime = undefined;
      }
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  async fetchToken() {
    if (!this._isMounted) return;

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

    const setModOnlyMessage = (resp) => {
      if (resp && resp.modOnlyMessage) {
        const sanitizedModOnlyText = SanitizeHTML(resp.modOnlyMessage, {
          allowedTags: ['a', 'b', 'br', 'i', 'img', 'li', 'small', 'span', 'strong', 'u', 'ul'],
          allowedAttributes: {
            a: ['href', 'name', 'target'],
            img: ['src', 'width', 'height'],
          },
          allowedSchemes: ['https'],
        });
        setModeratorOnlyMessage(sanitizedModOnlyText);
      }
      return resp;
    };

    const setCustomData = (resp) => {
      const { customdata } = resp;

      return new Promise((resolve) => {
        if (customdata.length) {
          makeCall('addUserSettings', customdata).then(r => resolve(r));
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
    logUserInfo();

    if (response.returncode !== 'FAILED') {
      await setAuth(response);

      setBannerProps(response);
      setLogoURL(response);
      setModOnlyMessage(response);

      Tracker.autorun(async (cd) => {
        const user = Users.findOne({ userId: Auth.userID, approved: true }, { fields: { _id: 1 } });

        if (user) {
          await setCustomData(response);
          cd.stop();
        }
      });

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
