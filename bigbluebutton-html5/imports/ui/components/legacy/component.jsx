import React, { Component } from 'react';
import { IntlProvider, FormattedMessage, addLocaleData } from 'react-intl';
import browser from 'browser-detect';
import './styles.css';


// currently supported locales.
import ar from 'react-intl/locale-data/ar';
import bg from 'react-intl/locale-data/bg';
import cs from 'react-intl/locale-data/cs';
import de from 'react-intl/locale-data/de';
import el from 'react-intl/locale-data/el';
import en from 'react-intl/locale-data/en';
import es from 'react-intl/locale-data/es';
import eu from 'react-intl/locale-data/eu';
import fa from 'react-intl/locale-data/fa';
import fi from 'react-intl/locale-data/fi';
import fr from 'react-intl/locale-data/fr';
import he from 'react-intl/locale-data/he';
import hi from 'react-intl/locale-data/hi';
import hu from 'react-intl/locale-data/hu';
import id from 'react-intl/locale-data/id';
import it from 'react-intl/locale-data/it';
import ja from 'react-intl/locale-data/ja';
import km from 'react-intl/locale-data/km';
import pl from 'react-intl/locale-data/pl';
import pt from 'react-intl/locale-data/pt';
import ru from 'react-intl/locale-data/ru';
import sv from 'react-intl/locale-data/sv';
import tr from 'react-intl/locale-data/tr';
import uk from 'react-intl/locale-data/uk';
import vi from 'react-intl/locale-data/vi';
import zh from 'react-intl/locale-data/zh';

// This class is the only component loaded on legacy (unsupported) browsers.
// What is included here needs to be minimal and carefully considered because some
// things can't be polyfilled.

addLocaleData([
  ...ar,
  ...bg,
  ...cs,
  ...de,
  ...el,
  ...en,
  ...es,
  ...eu,
  ...fa,
  ...fi,
  ...fr,
  ...he,
  ...hi,
  ...hu,
  ...id,
  ...it,
  ...ja,
  ...km,
  ...pl,
  ...pt,
  ...ru,
  ...sv,
  ...tr,
  ...uk,
  ...vi,
  ...zh,
]);

const FETCHING = 'fetching';
const FALLBACK = 'fallback';
const READY = 'ready';
const supportedBrowsers = ['chrome', 'firefox', 'safari', 'opera', 'edge', 'yandex'];

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
    const isChromeIos = browser().name === 'crios';

    let messageId = isSupportedBrowser ? 'app.legacy.upgradeBrowser' : 'app.legacy.unsupportedBrowser';
    if (isChromeIos) messageId = 'app.legacy.criosBrowser';

    switch (viewState) {
      case READY:
        return (
          <IntlProvider locale={normalizedLocale} messages={messages}>
            <p className="browserWarning">
              <FormattedMessage
                id={messageId}
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
            {isChromeIos ? (
              <span>Please use Safari on iOS for full support.</span>
            ) : (
              <span>
                <span>
                  It looks like you&#39;re using a browser that
                  is not fully supported. Please use either
                  {' '}
                </span>
                <a href="https://www.google.com/chrome/">Chrome</a>
                <span> or </span>
                <a href="https://getfirefox.com">Firefox</a>
                <span> for full support.</span>
              </span>
            )
            }
          </p>
        );
      case FETCHING:
      default:
        return null;
    }
  }
}
