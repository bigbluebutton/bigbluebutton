import React, { Component } from 'react';
import { IntlProvider, FormattedMessage } from 'react-intl';
import browser from 'browser-detect';
import './styles.css';

// This class is the only component loaded on legacy (unsupported) browsers.
// What is included here needs to be minimal and carefully considered because some
// things can't be polyfilled.

const FETCHING = 'fetching';
const FALLBACK = 'fallback';
const READY = 'ready';
const supportedBrowsers = ['chrome', 'firefox', 'safari', 'opera', 'edge'];

export default class Legacy extends Component {
  constructor(props) {
    super(props);

    const locale = navigator.languages ? navigator.languages[0] : false
      || navigator.language
      || Meteor.settings.public.app.defaultSettings.application.fallbackLocale;

    const url = `/html5client/locale?locale=${locale}`;

    const that = this;
    this.state = { viewState: FETCHING };
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          return Promise.reject();
        }

        return response.json();
      })
      .then(({ messages, normalizedLocale }) => {
        const dasherizedLocale = normalizedLocale.replace('_', '-');
        that.setState({ messages, normalizedLocale: dasherizedLocale, viewState: READY });
      })
      .catch(() => {
        that.setState({ viewState: FALLBACK });
      });
  }

  render() {
    const { messages, normalizedLocale, viewState } = this.state;
    const isSupportedBrowser = supportedBrowsers.includes(browser().name);

    switch (viewState) {
      case READY:
        return (
          <IntlProvider locale={normalizedLocale} messages={messages}>
            <p className="browserWarning">
              <FormattedMessage
                id={isSupportedBrowser ? 'app.legacy.upgradeBrowser' : 'app.legacy.unsupportedBrowser'}
                description="Warning when someone joins with a browser that isnt supported"
                values={{
                  0: <a href="https://www.google.com/chrome/">Chrome</a>,
                  1: <a href="https://getfirefox.com">Firefox</a>,
                }}
              />
            </p>
          </IntlProvider>
        );
      case FALLBACK:
        return (
          <p className="browserWarning">
            <span>It looks like you&#39;re using a browser that is not fully supported. Please use either </span>
            <a href="https://www.google.com/chrome/">Chrome</a>
            <span> or </span>
            <a href="https://getfirefox.com">Firefox</a>
            <span> for full support.</span>
          </p>
        );
      case FETCHING:
      default:
        return null;
    }
  }
}
