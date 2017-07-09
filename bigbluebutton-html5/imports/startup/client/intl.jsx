import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';

const propTypes = {
  locale: PropTypes.string.isRequired,
  baseControls: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired,
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
      appLocale: this.props.locale,
    };

    this.fetchLocalizedMessages = this.fetchLocalizedMessages.bind(this);
  }
  componentWillMount() {
    this.fetchLocalizedMessages(this.state.appLocale);
  }

  componentWillUpdate(nextProps) {
    if (this.props.locale !== nextProps.locale) {
      this.fetchLocalizedMessages(nextProps.locale);
    }
  }

  fetchLocalizedMessages(locale) {
    const url = `/html5client/locale?locale=${locale}`;

    const { baseControls } = this.props;
    this.setState({ appLocale: locale });

    baseControls.updateLoadingState(true);
    fetch(url)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        this.setState({ appLocale: 'en' });
        return response.json();
      })
      .then((messages) => {
        if (messages.statusCode === 506) {
          this.setState({ appLocale: 'en' });
        }
        this.setState({ messages: messages.messages }, () => {
          baseControls.updateLoadingState(false);
        });
      })
      .catch((reason) => {
        baseControls.updateErrorState(reason);
        baseControls.updateLoadingState(false);
      });
  }

  render() {
    return (
      <IntlProvider locale={this.state.appLocale} messages={this.state.messages}>
        {this.props.children}
      </IntlProvider>
    );
  }
}

export default IntlStartup;

IntlStartup.propTypes = propTypes;
IntlStartup.defaultProps = defaultProps;
