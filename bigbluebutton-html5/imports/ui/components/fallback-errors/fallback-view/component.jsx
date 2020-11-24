import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import { styles } from './styles';

const intlMessages = defineMessages({
  title: {
    id: 'app.error.fallback.view.title',
    description: 'title for presentation when fallback is showed',
  },
  description: {
    id: 'app.error.fallback.view.description',
    description: 'description for presentation when fallback is showed',
  },
  reloadButton: {
    id: 'app.error.fallback.view.reloadButton',
    description: 'Button label when fallback is showed',
  },
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  error: PropTypes.shape({
    message: PropTypes.string.isRequired,
  }),
};

const defaultProps = {
  error: {
    message: '',
  },
};

const FallbackView = ({ error, intl }) => (
  <div className={styles.background}>
    <h1 className={styles.codeError}>
      {intl.formatMessage(intlMessages.title)}
    </h1>
    <h1 className={styles.message}>
      {intl.formatMessage(intlMessages.description)}
    </h1>
    <div className={styles.separator} />
    <div className={styles.sessionMessage}>
      {error.message}
    </div>
    <div>
      <Button
        size="sm"
        color="primary"
        className={styles.button}
        onClick={() => window.location.reload()}
        label={intl.formatMessage(intlMessages.reloadButton)}
      />
    </div>
  </div>
);

FallbackView.propTypes = propTypes;
FallbackView.defaultProps = defaultProps;

export default injectIntl(FallbackView);
