import { Meteor } from 'meteor/meteor';
import Auth from '/imports/ui/services/auth';


export default function allowRedirectToLogoutURL() {
  const ALLOW_DEFAULT_LOGOUT_URL = Meteor.settings.public.app.allowDefaultLogoutUrl;
  if (Auth.logoutURL) {
    // default logoutURL
    if (Auth.logoutURL === window.location.origin) return ALLOW_DEFAULT_LOGOUT_URL;

    // custom logoutURL
    return true;
  }
  // no logout url
  return false;
}
