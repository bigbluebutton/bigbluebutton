import React from 'react';
import Button from '/imports/ui/components/button/component';
import { defineMessages, injectIntl } from 'react-intl';
import styles from './styles.scss';

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

export default injectIntl(AudioTest);
