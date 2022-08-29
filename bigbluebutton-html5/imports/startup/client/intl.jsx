import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';
import Settings from '/imports/ui/services/settings';
import LoadingScreen from '/imports/ui/components/common/loading-screen/component';
import getFromUserSettings from '/imports/ui/services/users-settings';
import _ from 'lodash';
import { Session } from 'meteor/session';
import Logger from '/imports/startup/client/logger';

const propTypes = {
  locale: PropTypes.string,
  overrideLocaleFromPassedParameter: PropTypes.string,
  children: PropTypes.element.isRequired,
};

const DEFAULT_LANGUAGE = Meteor.settings.public.app.defaultSettings.application.fallbackLocale;
const CLIENT_VERSION = Meteor.settings.public.app.html5ClientBuild;
const FALLBACK_ON_EMPTY_STRING = Meteor.settings.public.app.fallbackOnEmptyLocaleString;

const RTL_LANGUAGES = ['ar', 'dv', 'fa', 'he'];
const LARGE_FONT_LANGUAGES = ['te', 'km'];

const defaultProps = {
  locale: DEFAULT_LANGUAGE,
  overrideLocaleFromPassedParameter: null,
};

class IntlStartup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: {},
      normalizedLocale: null,
      fetching: true,
    };

    if (RTL_LANGUAGES.includes(props.locale)) {
      document.body.parentNode.setAttribute('dir', 'rtl');
    }

    this.fetchLocalizedMessages = this.fetchLocalizedMessages.bind(this);
  }

  componentDidMount() {
    const { locale, overrideLocaleFromPassedParameter } = this.props;
    this.fetchLocalizedMessages(overrideLocaleFromPassedParameter || locale, true);
  }

  componentDidUpdate(prevProps) {
    const { fetching, messages, normalizedLocale } = this.state;
    const { locale, overrideLocaleFromPassedParameter } = this.props;

    if (overrideLocaleFromPassedParameter !== prevProps.overrideLocaleFromPassedParameter) {
      this.fetchLocalizedMessages(overrideLocaleFromPassedParameter);
    } else {
      const shouldFetch = (!fetching && _.isEmpty(messages)) || ((locale !== prevProps.locale) && (normalizedLocale && (locale !== normalizedLocale)));
      if (shouldFetch) this.fetchLocalizedMessages(locale);
    }
  }

  fetchLocalizedMessages(locale, init = false) {
    const url = `./locale?locale=${locale}&init=${init}`;
    const localesPath = 'locales';

    this.setState({ fetching: true }, () => {
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            return false;
          }
          return response.json();
        })
        .then(({ normalizedLocale, regionDefaultLocale }) => {
          const fetchFallbackMessages = new Promise((resolve, reject) => {
            fetch(`${localesPath}/${DEFAULT_LANGUAGE}.json?v=${CLIENT_VERSION}`)
              .then((response) => {
                if (!response.ok) {
                  return reject();
                }
                return resolve(response.json());
              });
          });

          const fetchRegionMessages = new Promise((resolve) => {
            if (!regionDefaultLocale) {
              return resolve(false);
            }
            fetch(`${localesPath}/${regionDefaultLocale}.json?v=${CLIENT_VERSION}`)
              .then((response) => {
                if (!response.ok) {
                  return resolve(false);
                }
                return response.json()
                  .then((jsonResponse) => resolve(jsonResponse))
                  .catch(() => {
                    Logger.error({ logCode: 'intl_parse_locale_SyntaxError' }, `Could not parse locale file ${regionDefaultLocale}.json, invalid json`);
                    resolve(false);
                  });
              });
          });

          const fetchSpecificMessages = new Promise((resolve) => {
            if (!normalizedLocale || normalizedLocale === DEFAULT_LANGUAGE || normalizedLocale === regionDefaultLocale) {
              return resolve(false);
            }
            fetch(`${localesPath}/${normalizedLocale}.json?v=${CLIENT_VERSION}`)
              .then((response) => {
                if (!response.ok) {
                  return resolve(false);
                }
                return response.json()
                  .then((jsonResponse) => resolve(jsonResponse))
                  .catch(() => {
                    Logger.error({ logCode: 'intl_parse_locale_SyntaxError' }, `Could not parse locale file ${normalizedLocale}.json, invalid json`);
                    resolve(false);
                  });
              });
          });

          Promise.all([fetchFallbackMessages, fetchRegionMessages, fetchSpecificMessages])
            .then((values) => {
              let mergedMessages = Object.assign({}, values[0]);

              if (!values[1] && !values[2]) {
                normalizedLocale = DEFAULT_LANGUAGE;
              } else {
                if (values[1]) {
                  mergedMessages = Object.assign(mergedMessages, values[1]);
                }
                if (values[2]) {
                  mergedMessages = Object.assign(mergedMessages, values[2]);
                }
              }

              const dasherizedLocale = normalizedLocale.replace('_', '-');
              this.setState({ messages: mergedMessages, fetching: false, normalizedLocale: dasherizedLocale }, () => {
                Settings.application.locale = dasherizedLocale;
                if (RTL_LANGUAGES.includes(dasherizedLocale.substring(0, 2))) {
                  document.body.parentNode.setAttribute('dir', 'rtl');
                  Settings.application.isRTL = true;
                } else {
                  document.body.parentNode.setAttribute('dir', 'ltr');
                  Settings.application.isRTL = false;
                }
                Session.set('isLargeFont', LARGE_FONT_LANGUAGES.includes(dasherizedLocale.substring(0, 2)));
                window.dispatchEvent(new Event('localeChanged'));
                Settings.save();
              });
            });
        });
    });
  }

  render() {
    const { fetching, normalizedLocale, messages } = this.state;
    const { children } = this.props;

    return (
      <>
        {(fetching || !normalizedLocale) && <LoadingScreen />}

        {normalizedLocale
          && (
          <IntlProvider fallbackOnEmptyString={FALLBACK_ON_EMPTY_STRING} locale={normalizedLocale} messages={messages}>
            {children}
          </IntlProvider>
          )
        }
      </>
    );
  }
}

const IntlStartupContainer = withTracker(() => {
  const { locale } = Settings.application;
  const overrideLocaleFromPassedParameter = getFromUserSettings('bbb_override_default_locale', null);
  return {
    locale,
    overrideLocaleFromPassedParameter,
  };
})(IntlStartup);

export default IntlStartupContainer;

IntlStartup.propTypes = propTypes;
IntlStartup.defaultProps = defaultProps;
