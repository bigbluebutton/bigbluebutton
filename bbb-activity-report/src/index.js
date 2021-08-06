import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { IntlProvider } from 'react-intl';
import App from './App';
import reportWebVitals from './reportWebVitals';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      intlMessages: {},
      intlLocale: 'en',
    };

    this.setMessages();
  }

  setMessages() {
    let { language } = navigator;

    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    if (typeof params.lang !== 'undefined') {
      language = params.lang;
    }

    const fetchMessages = (lang) => new Promise((resolve, reject) => {
      const url = `./translations/${lang.replace('-', '_')}.json`;
      fetch(url).then((response) => {
        if (!response.ok) return reject();
        return resolve(response.json());
      });
    });

    Promise.all([fetchMessages('en'), fetchMessages(language)])
      .then((values) => {
        let mergedMessages = { ...values[0] };

        if (values[1]) {
          mergedMessages = Object.assign(mergedMessages, values[1]);
        }

        this.setState({ intlMessages: mergedMessages, intlLocale: language });
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
