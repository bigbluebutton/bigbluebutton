import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { renderRoutes } from '/imports/startup/client/routes';
import 'whatwg-fetch'

Meteor.startup(() => {
  if((window.navigator.platform === 'iPhone' || window.navigator.platform === 'iPad') && window.navigator.userAgent !== 'BigBlueButtonIOS') {
    if(confirm('Do you want to join using the BBB iOS WebRTC Application?')) {
      window.location = 'bbb://' + document.location.href;
      return;
    }
  }
  render(renderRoutes(), document.getElementById('app'));
});
