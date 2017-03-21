import React, { Component, PropTypes } from 'react';
import { IntlProvider } from 'react-intl';

const propTypes = {
  locale: PropTypes.string.isRequired,
};

const defaultProps = {
  locale: 'en',
};

class IntlStartup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: {},
    };

    this.fetchLocalizedMessages = this.fetchLocalizedMessages.bind(this);
  }

  fetchLocalizedMessages(locale) {
    const url = `/html5client/locale?locale=${locale}`;

    const { baseControls } = this.props;

    baseControls.updateLoadingState(true);
    fetch(url)
      .then(response => response.json())
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
    this.fetchLocalizedMessages(this.props.locale);
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.props.locale !== nextProps.locale) {
      this.fetchLocalizedMessages(nextProps.locale);
    }
  }

  render() {
    return (
      <IntlProvider locale={this.props.locale} messages={this.state.messages}>
        {this.props.children}
      </IntlProvider>
    );
  }
};

export default IntlStartup;

IntlStartup.propTypes = propTypes;
IntlStartup.defaultProps = defaultProps;
