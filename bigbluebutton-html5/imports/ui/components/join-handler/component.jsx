import React, { Component } from 'react';
import { Session } from 'meteor/session';
import PropTypes from 'prop-types';
import SanitizeHTML from 'sanitize-html';
import Auth from '/imports/ui/services/auth';
import { setCustomLogoUrl, setModeratorOnlyMessage } from '/imports/ui/components/user-list/service';
import { makeCall } from '/imports/ui/services/api';
import logger from '/imports/startup/client/logger';
import LoadingScreen from '/imports/ui/components/common/loading-screen/component';
import { CurrentUser } from '/imports/api/users';
import Settings from '/imports/ui/services/settings';
import { updateSettings } from '/imports/ui/components/settings/service';
import { LAYOUT_TYPE } from '/imports/ui/components/layout/enums';

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
      hasAlreadyJoined: false,
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
      const { hasAlreadyJoined } = this.state;
      if (status === 'connecting' && !hasAlreadyJoined) {
        this.setState({ joined: false });
      }

      logger.debug(`Initial connection status change. status: ${status}, connected: ${connected}`);
      if (connected) {
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
    const { hasAlreadyJoined } = this.state;
    const APP = Meteor.settings.public.app;
    if (!this._isMounted) return;

    const urlParams = new URLSearchParams(window.location.search);
    const sessionToken = urlParams.get('sessionToken');

    if (!sessionToken) {
      JoinHandler.setError('400');
      Session.set('errorMessageDescription', 'Session token was not provided');
    }

    // Old credentials stored in memory were being used when joining a new meeting
    if (!hasAlreadyJoined) {
      Auth.clearCredentials();
    }
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
          makeCall('addUserSettings', customdata).then((r) => resolve(r));
        }
        resolve(true);
      });
    };

    const setBannerProps = (resp) => {
      Session.set('bannerText', resp.bannerText);
      Session.set('bannerColor', resp.bannerColor);
    };

    const setUserDefaultLayout = (response) => {
      const settings = {
        application: {
          ...Settings.application,
          selectedLayout: LAYOUT_TYPE[response.defaultLayout] || 'custom',
        },
      };
      updateSettings(settings);
    };

    // use enter api to get params for the client
    const url = `${APP.bbbWebBase}/api/enter?sessionToken=${sessionToken}`;
    const fetchContent = await fetch(url, { credentials: 'include' });
    const parseToJson = await fetchContent.json();
    const { response } = parseToJson;

    setLogoutURL(response.logoutUrl);
    logUserInfo();

    if (response.returncode !== 'FAILED') {
      await setAuth(response);

      setBannerProps(response);
      setLogoURL(response);
      setModOnlyMessage(response);

      Tracker.autorun(async (cd) => {
        const user = CurrentUser
          .findOne({ userId: Auth.userID, approved: true }, { fields: { _id: 1 } });
        if (user) {
          await setCustomData(response);
          setUserDefaultLayout(response);
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

      if(['missingSession','meetingForciblyEnded','notFound'].includes(response.messageKey)) {
        JoinHandler.setError('410');
        Session.set('errorMessageDescription', 'meeting_ended');
      } else if(response.messageKey == "guestDeny") {
        JoinHandler.setError('401');
        Session.set('errorMessageDescription', 'guest_deny');
      } else if(response.messageKey == "maxParticipantsReached") {
        JoinHandler.setError('401');
        Session.set('errorMessageDescription', 'max_participants_reason');
      } else {
        JoinHandler.setError('401');
        Session.set('errorMessageDescription', response.message);
      }

      logger.error({
        logCode: 'joinhandler_component_joinroutehandler_error',
        extraInfo: {
          response,
          error: new Error(response.message),
        },
      }, 'User faced an error on main.joinRouteHandler.');
    }
    this.setState({
      joined: true,
      hasAlreadyJoined: true,
    });
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
