import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';

import styles from './styles.scss';

const intlMessages = defineMessages({
  500: {
    id: 'app.error.500',
    defaultMessage: 'Ops, something went wrong',
  },
  404: {
    id: 'app.error.404',
    defaultMessage: 'Not found',
  },
  401: {
    id: 'app.about.401',
    defaultMessage: 'Unauthorized',
  },
  403: {
    id: 'app.about.403',
    defaultMessage: 'Forbidden',
  },
});

const propTypes = {
  code: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
};

const defaultProps = {
  code: 500,
};

class ErrorScreen extends Component {
  render() {
    const { intl, code, children } = this.props;

    let formatedMessage = intl.formatMessage(intlMessages[500]);

    if (code in intlMessages) {
      formatedMessage = intl.formatMessage(intlMessages[code]);
    }

    return (
      <div className={styles.background}>
        <h1 className={styles.code}>
          {code}
        </h1>
        <h1 className={styles.message}>
          {formatedMessage}
        </h1>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    );
  }
}

export default injectIntl(ErrorScreen);

ErrorScreen.propTypes = propTypes;
ErrorScreen.defaultProps = defaultProps;
