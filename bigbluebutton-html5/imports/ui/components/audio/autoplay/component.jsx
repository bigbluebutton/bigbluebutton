import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import { defineMessages, intlShape, injectIntl } from 'react-intl';
import { styles } from './styles';


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
  intl: intlShape.isRequired,
};

class AudioAutoplayPrompt extends PureComponent {
  render() {
    const {
      intl,
      handleAllowAutoplay,
    } = this.props;
    return (
      <span className={styles.autoplayPrompt}>
        <Button
          className={styles.button}
          label={intl.formatMessage(intlMessages.confirmLabel)}
          aria-label={intl.formatMessage(intlMessages.confirmAriaLabel)}
          icon="thumbs_up"
          circle
          color="success"
          size="jumbo"
          onClick={handleAllowAutoplay}
        />
      </span>
    );
  }
}

export default injectIntl(AudioAutoplayPrompt);

AudioAutoplayPrompt.propTypes = propTypes;
