import React, { Component, PropTypes } from 'react';
import { IntlProvider } from 'react-intl';
import { loadMessages } from './services';
import { renderRoutes } from '../imports/startup/client/routes.js';
import Locales from '../imports/locales';

// Set the defaultLocale below for all <FormattedMessage /> default messages.
// The corresponding locale must be exported in /imports/locales/index.js
let defaultLocale = 'en';
let defaultMsgs;
let newMsgs;
let msgsUpdated = false;
let flag = true;

let browserLang = navigator.language.split('-');
let langRegion = browserLang[0] + '-' + browserLang[1].toUpperCase();
let lang = browserLang[0];
let region = browserLang[1].toUpperCase();

defaultMsgs = Locales[defaultLocale];

if (langRegion == defaultLocale || lang == defaultLocale) {
  flag = false;
}

class LangProvider extends Component {
   constructor(props) {
     super(props);
     this.state = {};
   }

   updateMessages(msgs) {
     let updatedMsgs = loadMessages(msgs, defaultLocale, lang, langRegion);
     return updatedMsgs;
   }

  render() {
    while (flag) {
      newMsgs = this.updateMessages(defaultMsgs);
      flag = false;
      msgsUpdated = true;
    }

    let passLocale;
    let passMsgs;

    if (msgsUpdated) {
      passLocale = newMsgs[0]; passMsgs = newMsgs[1];
    }else {
      passLocale = defaultLocale; passMsgs = defaultMsgs;
    }

    return (
      <IntlProvider locale={passLocale} messages={passMsgs}>
        {renderRoutes()}
      </IntlProvider>
    );
  }
}

export default LangProvider;
