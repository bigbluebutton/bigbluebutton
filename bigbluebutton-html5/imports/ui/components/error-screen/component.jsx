import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';

import styles from './styles.scss';

const intlMessages = defineMessages({
  500: {
    id: 'app.error.500',
  },
  404: {
    id: 'app.error.404',
  },
  401: {
    id: 'app.error.401',
  },
  403: {
    id: 'app.error.403',
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
