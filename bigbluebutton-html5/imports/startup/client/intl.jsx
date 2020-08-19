import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IntlProvider, addLocaleData } from 'react-intl';
import Settings from '/imports/ui/services/settings';
import LoadingScreen from '/imports/ui/components/loading-screen/component';

// currently supported locales.
import ar from 'react-intl/locale-data/ar';
import az from 'react-intl/locale-data/az';
import bg from 'react-intl/locale-data/bg';
import ca from 'react-intl/locale-data/ca';
import cs from 'react-intl/locale-data/cs';
import da from 'react-intl/locale-data/da';
import de from 'react-intl/locale-data/de';
import el from 'react-intl/locale-data/el';
import en from 'react-intl/locale-data/en';
import eo from 'react-intl/locale-data/eo';
import es from 'react-intl/locale-data/es';
import et from 'react-intl/locale-data/et';
import eu from 'react-intl/locale-data/eu';
import fa from 'react-intl/locale-data/fa';
import fi from 'react-intl/locale-data/fi';
import fr from 'react-intl/locale-data/fr';
import gl from 'react-intl/locale-data/gl';
import he from 'react-intl/locale-data/he';
import hi from 'react-intl/locale-data/hi';
import hr from 'react-intl/locale-data/hr';
import hu from 'react-intl/locale-data/hu';
import hy from 'react-intl/locale-data/hy';
import id from 'react-intl/locale-data/id';
import it from 'react-intl/locale-data/it';
import ja from 'react-intl/locale-data/ja';
import ka from 'react-intl/locale-data/ka';
import km from 'react-intl/locale-data/km';
import kn from 'react-intl/locale-data/kn';
import ko from 'react-intl/locale-data/ko';
import lt from 'react-intl/locale-data/lt';
import lv from 'react-intl/locale-data/lv';
import nb from 'react-intl/locale-data/nb';
import nl from 'react-intl/locale-data/nl';
import pl from 'react-intl/locale-data/pl';
import pt from 'react-intl/locale-data/pt';
import ro from 'react-intl/locale-data/ro';
import ru from 'react-intl/locale-data/ru';
import sk from 'react-intl/locale-data/sk';
import sl from 'react-intl/locale-data/sl';
import sr from 'react-intl/locale-data/sr';
import sv from 'react-intl/locale-data/sv';
import te from 'react-intl/locale-data/te';
import th from 'react-intl/locale-data/th';
import tr from 'react-intl/locale-data/tr';
import uk from 'react-intl/locale-data/uk';
import vi from 'react-intl/locale-data/vi';
import zh from 'react-intl/locale-data/zh';


addLocaleData([
  ...ar,
  ...az,
  ...bg,
  ...ca,
  ...cs,
  ...da,
  ...de,
  ...el,
  ...et,
  ...en,
  ...eo,
  ...es,
  ...eu,
  ...fa,
  ...fi,
  ...fr,
  ...gl,
  ...he,
  ...hi,
  ...hr,
  ...hu,
  ...hy,
  ...id,
  ...it,
  ...ja,
  ...ka,
  ...km,
  ...kn,
  ...ko,
  ...lt,
  ...lv,
  ...nb,
  ...nl,
  ...pl,
  ...pt,
  ...ro,
  ...ru,
  ...sk,
  ...sl,
  ...sr,
  ...sv,
  ...te,
  ...th,
  ...tr,
  ...uk,
  ...vi,
  ...zh,
]);

const propTypes = {
  locale: PropTypes.string,
  children: PropTypes.element.isRequired,
};

const DEFAULT_LANGUAGE = Meteor.settings.public.app.defaultSettings.application.locale;

const RTL_LANGUAGES = ['ar', 'he', 'fa'];

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
    this.fetchLocalizedMessages(locale, true);
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

  fetchLocalizedMessages(locale, init = false) {
    const url = `/html5client/locale?locale=${locale}&init=${init}`;

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
            this.saveLocale(dasherizedLocale);
          });
        })
        .catch(() => {
          this.setState({ fetching: false, normalizedLocale: null }, () => {
            this.saveLocale(DEFAULT_LANGUAGE);
          });
        });
    });
  }

  saveLocale(localeName) {
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
