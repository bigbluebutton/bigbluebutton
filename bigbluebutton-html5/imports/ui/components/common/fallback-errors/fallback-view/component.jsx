import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Styled from './styles';

const intlMessages = defineMessages({
  title: {
    id: 'app.error.fallback.presentation.title',
    description: 'title for presentation when fallback is showed',
  },
  description: {
    id: 'app.error.fallback.presentation.description',
    description: 'description for presentation when fallback is showed',
  },
  reloadButton: {
    id: 'app.error.fallback.presentation.reloadButton',
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
  <Styled.Background>
    <Styled.CodeError>
      {intl.formatMessage(intlMessages.title)}
    </Styled.CodeError>
    <Styled.Message>
      {intl.formatMessage(intlMessages.description)}
    </Styled.Message>
    <Styled.Separator />
    <Styled.SessionMessage>
      {error.message}
    </Styled.SessionMessage>
    <div>
      <Styled.ReloadButton
        size="sm"
        color="primary"
        onClick={() => window.location.reload()}
        label={intl.formatMessage(intlMessages.reloadButton)}
      />
    </div>
  </Styled.Background>
);

FallbackView.propTypes = propTypes;
FallbackView.defaultProps = defaultProps;

export default injectIntl(FallbackView);
