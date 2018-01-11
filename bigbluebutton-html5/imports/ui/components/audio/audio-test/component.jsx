import React from 'react';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import { defineMessages, intlShape, injectIntl } from 'react-intl';
import { styles } from './styles.scss';

const propTypes = {
  intl: intlShape.isRequired,
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

    return (
      <Button
        className={styles.testAudioBtn}
        label={intl.formatMessage(intlMessages.playSoundLabel)}
        icon={'unmute'}
        size={'sm'}
        color={'primary'}
        onClick={() => this.handlePlayAudioSample(outputDeviceId)}
      />
    );
  }
}

AudioTest.propTypes = propTypes;
AudioTest.defaultProps = defaultProps;

export default injectIntl(AudioTest);
