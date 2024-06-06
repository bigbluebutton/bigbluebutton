import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';
import Settings from '/imports/ui/services/settings';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  handlePlayAudioSample: PropTypes.func.isRequired,
  outputDeviceId: PropTypes.string,
};

const defaultProps = {
  outputDeviceId: null,
};

const intlMessages = defineMessages({
  playSoundLabel: {
    id: 'app.audio.playSoundLabel',
    description: 'Play sound button label',
  },
});

class AudioTest extends React.Component {
  constructor(props) {
    super(props);

    this.handlePlayAudioSample = props.handlePlayAudioSample.bind(this);
  }

  render() {
    const {
      outputDeviceId,
      intl,
    } = this.props;

    const { animations } = Settings.application;

    return (
      <Styled.TestAudioButton
        label={intl.formatMessage(intlMessages.playSoundLabel)}
        icon="unmute"
        size="sm"
        color="primary"
        onClick={() => this.handlePlayAudioSample(outputDeviceId)}
        animations={animations}
      />
    );
  }
}

AudioTest.propTypes = propTypes;
AudioTest.defaultProps = defaultProps;

export default injectIntl(AudioTest);
