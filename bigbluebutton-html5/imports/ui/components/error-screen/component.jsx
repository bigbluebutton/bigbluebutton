import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';

import styles from './styles.scss';

const intlMessages = defineMessages({
  500: {
    id: 'app.error.500',
    description: '500 error message',
  },
  404: {
    id: 'app.error.404',
    description: '404 error message',
  },
  401: {
    id: 'app.about.401',
    description: '401 error message',
  },
  403: {
    id: 'app.about.403',
    description: '403 error message',
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
