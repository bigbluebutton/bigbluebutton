import React, { Component, PropTypes } from 'react';
import { IntlProvider } from 'react-intl';

const propTypes = {
  locale: PropTypes.string.isRequired,
};

const defaultProps = {
  locale: 'en',
};

let appLocale;

class IntlStartup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: {},
    };

    appLocale = this.props.locale;
    
    this.fetchLocalizedMessages = this.fetchLocalizedMessages.bind(this);
  }

  fetchLocalizedMessages(locale) {
    const url = `/html5client/locale?locale=${locale}`;

    const { baseControls } = this.props;

    baseControls.updateLoadingState(true);
    fetch(url)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          appLocale = 'en';
          return response.json();
        }
      })
      .then(messages => {
        this.setState({ messages }, () => {
          baseControls.updateLoadingState(false);
        });
      })
      .catch(reason => {
        baseControls.updateErrorState(reason);
        baseControls.updateLoadingState(false);
      });
  }

  componentWillMount() {
    this.fetchLocalizedMessages(appLocale);
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.props.locale !== nextProps.locale) {
      appLocale = nextProps.locale;
      this.fetchLocalizedMessages(appLocale);
    }
  }

  render() {
    return (
      <IntlProvider locale={appLocale} messages={this.state.messages}>
        {this.props.children}
      </IntlProvider>
    );
  }
};

export default IntlStartup;

IntlStartup.propTypes = propTypes;
IntlStartup.defaultProps = defaultProps;
