import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';
import Settings from '/imports/ui/services/settings';
import LoadingScreen from '/imports/ui/components/loading-screen/component';
import getFromUserSettings from '/imports/ui/services/users-settings';
import _ from 'lodash';

const propTypes = {
  locale: PropTypes.string,
  children: PropTypes.element.isRequired,
};

const DEFAULT_LANGUAGE = Meteor.settings.public.app.defaultSettings.application.fallbackLocale;

const RTL_LANGUAGES = ['ar', 'he', 'fa'];

const defaultProps = {
  locale: DEFAULT_LANGUAGE,
};

class IntlStartup extends Component {
  static saveLocale(localeName) {
    Settings.application.locale = localeName;
    if (RTL_LANGUAGES.includes(localeName.substring(0, 2))) {
      document.body.parentNode.setAttribute('dir', 'rtl');
      Settings.application.isRTL = true;
    } else {
      document.body.parentNode.setAttribute('dir', 'ltr');
      Settings.application.isRTL = false;
    }
    Settings.save();
  }

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
    const { locale } = this.props;
    const shouldFetch = (!fetching && _.isEmpty(messages)) || ((locale !== prevProps.locale) && (normalizedLocale && (locale !== normalizedLocale)));
    if (shouldFetch) this.fetchLocalizedMessages(locale);
  }

  fetchLocalizedMessages(locale, init = false) {
    const url = `./locale?locale=${locale}&init=${init}`;
    const localesPath = 'locales';

    this.setState({ fetching: true }, () => {
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            return Promise.reject();
          }

          return response.json();
        })
        .then(({ normalizedLocale, regionDefaultLocale }) => {
          fetch(`${localesPath}/${DEFAULT_LANGUAGE}.json`)
            .then((response) => {
              if (!response.ok) {
                return Promise.reject();
              }
              return response.json();
            })
            .then((messages) => {
              if (regionDefaultLocale !== '') {
                fetch(`${localesPath}/${regionDefaultLocale}.json`)
                  .then((response) => {
                    if (!response.ok) {
                      return Promise.resolve();
                    }
                    return response.json();
                  })
                  .then((regionDefaultMessages) => {
                    messages = Object.assign(messages, regionDefaultMessages);
                    return messages;
                  });
              }

              if (normalizedLocale !== DEFAULT_LANGUAGE && normalizedLocale !== regionDefaultLocale) {
                fetch(`${localesPath}/${normalizedLocale}.json`)
                  .then((response) => {
                    if (!response.ok) {
                      return Promise.reject();
                    }
                    return response.json();
                  })
                  .then((localeMessages) => {
                    messages = Object.assign(messages, localeMessages);
                    return messages;
                  })
                  .catch(() => {
                    normalizedLocale = (regionDefaultLocale) || DEFAULT_LANGUAGE;
                    const dasherizedLocale = normalizedLocale.replace('_', '-');
                    this.setState({ messages, fetching: false, normalizedLocale: dasherizedLocale }, () => {
                      IntlStartup.saveLocale(normalizedLocale);
                    });
                  });
              }

              return messages;
            })
            .then((messages) => {
              const dasherizedLocale = normalizedLocale.replace('_', '-');
              this.setState({ messages, fetching: false, normalizedLocale: dasherizedLocale }, () => {
                IntlStartup.saveLocale(dasherizedLocale);
              });
            })
            .catch(() => {
              normalizedLocale = DEFAULT_LANGUAGE;
              const dasherizedLocale = normalizedLocale.replace('_', '-');
              this.setState({ fetching: false, normalizedLocale: dasherizedLocale }, () => {
                IntlStartup.saveLocale(normalizedLocale);
              });
            });
        })
        .catch(() => {
          this.setState({ fetching: false, normalizedLocale: null }, () => {
            IntlStartup.saveLocale(DEFAULT_LANGUAGE);
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
          <IntlProvider locale={normalizedLocale} messages={messages}>
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
