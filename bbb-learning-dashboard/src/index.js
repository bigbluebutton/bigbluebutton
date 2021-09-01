import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { IntlProvider } from 'react-intl';
import App from './App';
import reportWebVitals from './reportWebVitals';

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
  }

  setMessages() {
    const fetchMessages = (lang) => new Promise((resolve, reject) => {
      const url = `/html5client/locales/${lang.replace('-', '_')}.json`;
      fetch(url).then((response) => {
        if (!response.ok) return reject();
        return resolve(response.json());
      });
    });

    Promise.all([fetchMessages('en'), fetchMessages(getLanguage())])
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

  render() {
    const { intlLocale, intlMessages } = this.state;

    return (
      <IntlProvider defaultLocale="en" locale={intlLocale} messages={intlMessages}>
        <App />
      </IntlProvider>
    );
  }
}

const rootElement = document.getElementById('root');
ReactDOM.render(<Dashboard />, rootElement);

reportWebVitals();
