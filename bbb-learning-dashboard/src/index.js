import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { IntlProvider } from 'react-intl';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { UserDetailsProvider } from './components/UserDetails/context';
import { resolveLocale } from './locales';

const RTL_LANGUAGES = ['ar', 'dv', 'fa', 'he'];

function isValidLocale(locale) {
  try {
    const intl = new Intl.Locale(locale);
    return !!intl;
  } catch (error) {
    return false;
  }
}

function getLanguage() {
  let { language } = navigator;

  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  if (typeof params.lang !== 'undefined') {
    language = params.lang;
  }

  return language;
}

class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      intlMessages: {},
      intlLocale: getLanguage(),
    };

    this.setMessages();
    this.setLocaleAttributes();
  }

  setMessages() {
    const { intlLocale } = this.state;
    const fetchMessages = (lang) => new Promise((resolve, reject) => {
      const localesBase = process.env.REACT_APP_STANDALONE_MODE === 'true' ? '.' : '/html5client';
      const url = `${localesBase}/locales/${resolveLocale(lang)}.json`;
      fetch(url).then((response) => {
        if (!response.ok) return reject();
        return resolve(response.json());
      });
    });

    Promise.all([fetchMessages('en'), fetchMessages(intlLocale)])
      .then((values) => {
        let mergedMessages = {};

        if (values[0]) {
          mergedMessages = Object.assign(mergedMessages, values[0]);
        }

        if (values[1]) {
          mergedMessages = Object.assign(mergedMessages, values[1]);
        }

        this.setState({ intlMessages: mergedMessages });
      }).catch(() => {});
  }

  setLocaleAttributes() {
    const { intlLocale } = this.state;

    // index.html ships lang="en"; leaving it there while rendering another locale
    // makes browsers offer to auto-translate the page. Update it.
    if (isValidLocale(intlLocale)) {
      document.body.parentNode.setAttribute('lang', intlLocale);
    }

    if (RTL_LANGUAGES.includes(intlLocale.substring(0, 2))) {
      document.body.parentNode.setAttribute('dir', 'rtl');
    } else {
      document.body.parentNode.setAttribute('dir', 'ltr');
    }
  }

  render() {
    const { intlLocale, intlMessages } = this.state;

    const locale = isValidLocale(intlLocale) ? intlLocale : undefined;

    return (
      <UserDetailsProvider>
        <IntlProvider defaultLocale="en" locale={locale} messages={intlMessages}>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </IntlProvider>
      </UserDetailsProvider>
    );
  }
}

const rootElement = document.getElementById('root');
ReactDOM.render(<Dashboard />, rootElement);
