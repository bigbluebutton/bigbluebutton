import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';

const intlMessages = defineMessages({
  confirmLabel: {
    id: 'app.audioModal.playAudio',
    description: 'Play audio prompt for autoplay',
  },
  confirmAriaLabel: {
    id: 'app.audioModal.playAudio.arialabel',
    description: 'Provides better context for play audio prompt btn label',
  },
});

const propTypes = {
  handleAllowAutoplay: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

class AudioAutoplayPrompt extends PureComponent {
  render() {
    const {
      intl,
      handleAllowAutoplay,
    } = this.props;
    return (
      <Styled.AutoplayPrompt>
        <Styled.AutoplayButton
          label={intl.formatMessage(intlMessages.confirmLabel)}
          aria-label={intl.formatMessage(intlMessages.confirmAriaLabel)}
          icon="thumbs_up"
          circle
          color="success"
          size="jumbo"
          onClick={handleAllowAutoplay}
        />
      </Styled.AutoplayPrompt>
    );
  }
}

export default injectIntl(AudioAutoplayPrompt);

AudioAutoplayPrompt.propTypes = propTypes;
