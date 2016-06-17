import React from 'react';
import Button from '/imports/ui/components/button/component';
import BaseMenu from './BaseMenu';
import { callServer } from '/imports/ui/services/api';
import Auth from '/imports/ui/services/auth';
import Storage from '/imports/ui/services/storage';

export default class SessionMenu extends BaseMenu {
  constructor(props) {
    super(props);
  }

  logout() {
    let logoutURL = Storage.get('logoutURL');
    callServer('userLogout');
    Auth.clearCredentials(document.location = logoutURL);
  }

  render() {
    return (
      <div>{this.logout()}</div>
    );
  }
};
