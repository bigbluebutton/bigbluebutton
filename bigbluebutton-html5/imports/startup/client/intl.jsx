import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';
import Settings from '/imports/ui/services/settings';
import LoadingScreen from '/imports/ui/components/loading-screen/component';

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
    this.fetchLocalizedMessages(this.props.locale);
  }

  componentWillUpdate(nextProps) {
    if (!this.state.fetching
      && this.state.normalizedLocale
      && nextProps.locale.toLowerCase() !== this.state.normalizedLocale.toLowerCase()) {
      this.fetchLocalizedMessages(nextProps.locale);
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
    return this.state.fetching ? <LoadingScreen /> : (
      <IntlProvider locale={DEFAULT_LANGUAGE} messages={this.state.messages}>
        {this.props.children}
      </IntlProvider>
    );
  }
}

export default IntlStartup;

IntlStartup.propTypes = propTypes;
IntlStartup.defaultProps = defaultProps;
