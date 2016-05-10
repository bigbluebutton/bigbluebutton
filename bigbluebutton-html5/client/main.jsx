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

/* TODO: We should load the en first then merge with the en-US
   (eg: load country translation then region) */
let messages = Locales[locale] || Locales['en'] || {};

Meteor.startup(() => {
  render((
    <IntlProvider locale={locale} messages={messages}>
      {renderRoutes()}
    </IntlProvider>
  ), document.getElementById('app'));
});
