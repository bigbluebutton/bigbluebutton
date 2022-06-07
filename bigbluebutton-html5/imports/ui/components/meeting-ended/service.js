import { Meteor } from 'meteor/meteor';
import Auth from '/imports/ui/services/auth';


export default function allowRedirectToLogoutURL() {
  const ALLOW_DEFAULT_LOGOUT_URL = Meteor.settings.public.app.allowDefaultLogoutUrl;
  const protocolPattern = /^((http|https):\/\/)/;
  if (Auth.logoutURL) {
    // default logoutURL
    // compare only the host to ignore protocols
    const urlWithoutProtocolForAuthLogout = Auth.logoutURL.replace(protocolPattern, '');
    const urlWithoutProtocolForLocationOrigin = window.location.origin.replace(protocolPattern, '');
    if (urlWithoutProtocolForAuthLogout === urlWithoutProtocolForLocationOrigin) {
      return ALLOW_DEFAULT_LOGOUT_URL;
    }

    // custom logoutURL
    return true;
  }
  // no logout url
  return false;
}
