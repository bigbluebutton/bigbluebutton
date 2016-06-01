import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { renderRoutes } from '../imports/startup/client/routes.js';
import { IntlProvider, addLocaleData } from 'react-intl';

import Locales from '../imports/locales';

import en from 'react-intl/locale-data/en';
import es from 'react-intl/locale-data/es';
import pt from 'react-intl/locale-data/pt';

/* TODO: Add this dynamically */
addLocaleData([...en, ...es, ...pt]);

// Safari sends us en-us instead of en-US
let locale = navigator.language.split('-');
locale = locale[1] ? `${locale[0]}-${locale[1].toUpperCase()}` : navigator.language;
// locale = 'pt-BR'; // Set a locale for testing 
/* TODO: We should load the en first then merge with the en-US
   (eg: load country translation then region) */
let messages = Locales[locale] || Locales['en'] || {};

// Helper to load javascript libraries from the BBB server
function loadLib(libname, success, fail) {
  const successCallback = function (cb) {
    console.log(`successfully loaded lib - ${this}`);
    if (typeof (cb) == 'function' || cb instanceof Function) {
      cb();
    }
  };

  const failCallback = function (cb) {
    console.log(`failed to load lib - ${this}`);
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
  loadLib('jquery.verto.js', function () {
    loadLib('verto_extension.js');
  });

  loadLib('jquery.jsonrpcclient.js');
  loadLib('verto_extension_share.js');

  render((
    <IntlProvider locale={locale} messages={messages}>
      {renderRoutes()}
    </IntlProvider>
  ), document.getElementById('app'));
});
