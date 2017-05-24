import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { renderRoutes } from '/imports/startup/client/routes';
import 'whatwg-fetch'

Meteor.startup(() => {
  let now = new Date().valueOf();

  if((window.navigator.platform === 'iPhone' || window.navigator.platform === 'iPad') && window.navigator.userAgent !== 'BigBlueButton') {
    if(confirm('Do you want to join using the BBB iOS WebRTC Application?')) {
      window.location = 'bbb://' + document.location.href;
      return;
    }
  }
  //setTimeout(function () {
  //   if (new Date().valueOf() - now > 100) return;
  //   window.fetch = fetch;
  render(renderRoutes(), document.getElementById('app'));
  //}, 25);
  //let iframe = document.getElementById('sorry-frame');
  //iframe.setAttribute('src', 'bbb-webrtc-ios://' + document.location.href);
  //window.location = 'bbb-webrtc-ios://' + document.location.href;
  console.log('não me arrependo de nada', fetch);
});
