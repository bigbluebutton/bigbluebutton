import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { renderRoutes } from '../imports/startup/client/routes.js';
import { IntlProvider } from 'react-intl';

let defaultLocale = 'en';
let browserLanguage = navigator.language;
let messages;

function loadMessages(browserLanguage) {
  $.ajax({
    type: 'GET',
    async: false,
    url: `http://192.168.32.128/html5client/locale?locale=${browserLanguage}`,
    dataType: 'json',
    success: setMessages,
    error: err,
  });

  function setMessages(data) {
    messages = data;
  }

  function err(data) {
    console.log('Error : Locale Not Found,  Using Default');
  }
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

  loadMessages(browserLanguage);

  render((
    <IntlProvider  locale={defaultLocale} messages={messages}>
      {renderRoutes()}
    </IntlProvider>
  ), document.getElementById('app'));
});
