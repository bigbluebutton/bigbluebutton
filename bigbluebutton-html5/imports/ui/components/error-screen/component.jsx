import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import { withRouter } from 'react-router';
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
    id: 'app.error.401',
  },
  leave: {
    id: 'app.error.leaveLabel',
    description: 'aria-label for leaving',
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
    const {
      intl, code, children, router,
    } = this.props;

    let formatedMessage = intl.formatMessage(intlMessages[defaultProps.code]);

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
        <div className={styles.content}>
          <Button
            size="sm"
            onClick={() => router.push('/logout/')}
            label={intl.formatMessage(intlMessages.leave)}
          />
        </div>
      </div>
    );
  }
}

export default withRouter(injectIntl(ErrorScreen));

ErrorScreen.propTypes = propTypes;
ErrorScreen.defaultProps = defaultProps;
