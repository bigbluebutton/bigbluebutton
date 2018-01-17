import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';
import Settings from '/imports/ui/services/settings';

const propTypes = {
  locale: PropTypes.string.isRequired,
  baseControls: PropTypes.shape({
    updateErrorState: PropTypes.func.isRequired,
    updateLoadingState: PropTypes.func.isRequired,
  }).isRequired,
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
      locale: DEFAULT_LANGUAGE,
    };

    this.fetchLocalizedMessages = this.fetchLocalizedMessages.bind(this);
  }
  componentWillMount() {
    this.fetchLocalizedMessages(this.props.locale);
  }

  componentWillUpdate(nextProps) {
    if (nextProps.locale && this.props.locale !== nextProps.locale) {
      this.fetchLocalizedMessages(nextProps.locale);
    }
  }

  fetchLocalizedMessages(locale) {
    const url = `/html5client/locale?locale=${locale}`;

    const { baseControls } = this.props;

    baseControls.updateLoadingState(true);
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          return Promise.reject();
        }

        return response.json();
      })
      .then(({ messages, normalizedLocale }) => {
        const dasherizedLocale = normalizedLocale.replace('_', '-')
        this.setState({ messages, locale: dasherizedLocale }, () => {
          Settings.application.locale = dasherizedLocale;
          Settings.save();
          baseControls.updateLoadingState(false);
        });
      })
      .catch((messages) => {
        this.setState({ locale: DEFAULT_LANGUAGE }, () => {
          Settings.application.locale = DEFAULT_LANGUAGE;
          Settings.save();
          baseControls.updateLoadingState(false);
        });
      });
  }

  render() {
    return (
      <IntlProvider locale={this.state.locale} messages={this.state.messages}>
        {this.props.children}
      </IntlProvider>
    );
  }
}

export default IntlStartup;

IntlStartup.propTypes = propTypes;
IntlStartup.defaultProps = defaultProps;
