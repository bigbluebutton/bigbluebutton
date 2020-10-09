import { Meteor } from 'meteor/meteor';
import Auth from '/imports/ui/services/auth';
import logger from '/imports/startup/client/logger';

export default function allowRedirectToLogoutURL() {
  const ALLOW_DEFAULT_LOGOUT_URL = Meteor.settings.public.app.allowDefaultLogoutUrl;
  if (Auth.logoutURL) {
    // default logoutURL case
    // compare only the host to ignore protocols, www, trailing '/', etc
    try {
      // new URL object with invalid url throws an error and could crash the application
      const urlWithoutProtocolForAuthLogout = new URL(Auth.logoutURL).host;
      const urlWithoutProtocolForLocationOrigin = new URL(window.location.origin).host;
      if (urlWithoutProtocolForAuthLogout === urlWithoutProtocolForLocationOrigin) {
        return ALLOW_DEFAULT_LOGOUT_URL;
      }
    } catch (error) {
      // there was an issue checking if the passed logoutURL was a valid URL.
      // Do not use it for a redirect
      logger.error({ logCode: 'meeting_ended_logouturl_redirect_error', extraInfo: { error, logoutURL: Auth.logoutURL } },
        'There was an issue checking if the passed logoutURL was a valid URL');
      return false;
    }

    // custom logoutURL
    return true;
  }
  // no logout url
  return false;
}
