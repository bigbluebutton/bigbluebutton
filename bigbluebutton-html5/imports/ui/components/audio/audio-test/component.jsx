import React from 'react';
import Button from '/imports/ui/components/button/component';
import styles from './styles.scss';
import { defineMessages, injectIntl } from 'react-intl';
import { withIosHandler } from '/imports/ui/components/ios-handler/service';

class AudioTest extends React.Component {
  constructor(props) {
    super(props);

    this.handlePlayAudioSample = this.handlePlayAudioSample.bind(this);
  }

  handlePlayAudioSample() {
    this.props.handlePlayAudioSample();
  }

  render() {
    const {
      intl,
    } = this.props;

    return (
      <Button
        className={styles.testAudioBtn}
        label={intl.formatMessage(intlMessages.playSoundLabel)}
        icon={'unmute'}
        size={'sm'}
        color={'primary'}
        onClick={this.handlePlayAudioSample}
      />
    );
  }
}

const intlMessages = defineMessages({
  playSoundLabel: {
    id: 'app.audio.playSoundLabel',
    description: 'Play sound button label',
  },
});

const iosHandlers = {
  'handlePlayAudioSample': 'restartMeter',
};

export default injectIntl(withIosHandler(AudioTest, iosHandlers));
