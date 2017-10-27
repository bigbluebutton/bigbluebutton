import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';

const propTypes = {
  locale: PropTypes.string.isRequired,
  baseControls: PropTypes.shape.isRequired,
  children: PropTypes.shape.isRequired,
};

const BROWSER_LANGUAGE = window.navigator.userLanguage || window.navigator.language;

const defaultProps = {
  locale: BROWSER_LANGUAGE,
};

class IntlStartup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: {},
    };

    this.fetchLocalizedMessages = this.fetchLocalizedMessages.bind(this);
  }
  componentWillMount() {
    this.fetchLocalizedMessages(this.props.locale);
  }

  componentWillUpdate(nextProps) {
    if (this.props.locale !== nextProps.locale) {
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
        this.setState({ messages, locale: normalizedLocale.replace('_', '-') }, () => {
          baseControls.updateLoadingState(false);
        });
      })
      .catch(() => {
        this.setState({ locale: 'en' });
        baseControls.updateLoadingState(false);
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
