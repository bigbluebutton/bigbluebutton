import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IntlProvider, addLocaleData } from 'react-intl';
import Settings from '/imports/ui/services/settings';
import LoadingScreen from '/imports/ui/components/loading-screen/component';

// currently supported locales.
import en from 'react-intl/locale-data/en';
import uk from 'react-intl/locale-data/uk';
import zh from 'react-intl/locale-data/zh';
import ru from 'react-intl/locale-data/ru';
import de from 'react-intl/locale-data/de';
import fr from 'react-intl/locale-data/fr';
import pt from 'react-intl/locale-data/pt';
import fa from 'react-intl/locale-data/fa';
import tr from 'react-intl/locale-data/tr';
import ja from 'react-intl/locale-data/ja';
import km from 'react-intl/locale-data/km';
import es from 'react-intl/locale-data/es';
import id from 'react-intl/locale-data/id';
import el from 'react-intl/locale-data/el';
import it from 'react-intl/locale-data/it';
import bg from 'react-intl/locale-data/bg';


addLocaleData([
  ...en,
  ...uk,
  ...zh,
  ...ru,
  ...de,
  ...fr,
  ...pt,
  ...fa,
  ...tr,
  ...ja,
  ...km,
  ...es,
  ...id,
  ...el,
  ...it,
  ...bg,
]);

const propTypes = {
  locale: PropTypes.string,
  children: PropTypes.element.isRequired,
};

const DEFAULT_LANGUAGE = Meteor.settings.public.app.defaultSettings.application.locale;

const defaultProps = {
  locale: DEFAULT_LANGUAGE,
};

class IntlStartup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: {},
      normalizedLocale: null,
      fetching: false,
    };

    this.fetchLocalizedMessages = this.fetchLocalizedMessages.bind(this);
  }

  componentWillMount() {
    const { locale } = this.props;
    this.fetchLocalizedMessages(locale);
  }

  componentWillUpdate(nextProps) {
    const { fetching, normalizedLocale } = this.state;
    const { locale } = nextProps;

    if (!fetching
      && normalizedLocale
      && locale.toLowerCase() !== normalizedLocale.toLowerCase()) {
      this.fetchLocalizedMessages(locale);
    }
  }

  fetchLocalizedMessages(locale) {
    const url = `/html5client/locale?locale=${locale}`;

    this.setState({ fetching: true }, () => {
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            return Promise.reject();
          }

          return response.json();
        })
        .then(({ messages, normalizedLocale }) => {
          const dasherizedLocale = normalizedLocale.replace('_', '-');
          this.setState({ messages, fetching: false, normalizedLocale: dasherizedLocale }, () => {
            Settings.application.locale = dasherizedLocale;
            Settings.save();
          });
        })
        .catch(() => {
          this.setState({ fetching: false, normalizedLocale: null }, () => {
            Settings.application.locale = DEFAULT_LANGUAGE;
            Settings.save();
          });
        });
    });
  }

  render() {
    const { fetching, normalizedLocale, messages } = this.state;
    const { children } = this.props;

    return fetching ? <LoadingScreen /> : (
      <IntlProvider locale={normalizedLocale} messages={messages}>
        {children}
      </IntlProvider>
    );
  }
}

export default IntlStartup;

IntlStartup.propTypes = propTypes;
IntlStartup.defaultProps = defaultProps;
