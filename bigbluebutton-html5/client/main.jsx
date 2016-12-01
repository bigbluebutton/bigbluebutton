import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { renderRoutes } from '../imports/startup/client/routes.js';
import { IntlProvider } from 'react-intl';

function setMessages(data) {
  let messages = data;
  let defaultLocale = 'en';

  render((
    <IntlProvider  locale={defaultLocale} messages={messages}>
      {renderRoutes()}
    </IntlProvider>
  ), document.getElementById('app'));
}

// Helper to load javascript libraries from the BBB server
function loadLib(libname, success, fail) {
  const successCallback = function (cb) {
    console.log(`successfully loaded lib - ${this}`);
    if (typeof (cb) == 'function' || cb instanceof Function) {
      cb();
    }
  };

  const failCallback = function (cb, issue) {
    console.error(`failed to load lib - ${this}`);
    console.error(issue);
    if (typeof (cb) == 'function' || cb instanceof Function) {
      cb();
    }
  };

  return Meteor.Loader.loadJs(`${window.location.origin}/client/lib/${libname}`,
    successCallback.bind(libname, success), 10000).fail(failCallback.bind(libname, fail));
};

Meteor.startup(() => {
  loadLib('sip.js');
  loadLib('bbb_webrtc_bridge_sip.js');
  loadLib('bbblogger.js');
  loadLib('jquery.json-2.4.min.js');
  loadLib('jquery.FSRTC.js');
  loadLib('jquery.verto.js');
  loadLib('verto_extension.js');
  loadLib('jquery.jsonrpcclient.js');
  loadLib('Screen-Capturing.js');
  loadLib('getScreenId.js');

  let browserLanguage = navigator.language;
  let request = new Request
    (`${window.location.origin}/html5client/locale?locale=${browserLanguage}`);

  fetch(request, { method: 'GET' })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      setMessages(data);
    })
    .catch(function error(err) {
      console.log('request failed', err);
    });

});

