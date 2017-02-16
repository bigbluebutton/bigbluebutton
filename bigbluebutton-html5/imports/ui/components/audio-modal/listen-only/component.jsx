import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import { clearModal } from '/imports/ui/components/app/service';
import styles from '../styles.scss';

import DeviceSelector from '/imports/ui/components/audio/device-selector/component';
import AudioTestContainer from '/imports/ui/components/audio-test/container';
import EnterAudioContainer from '/imports/ui/components/enter-audio/container';

const intlMessages = defineMessages({
  backLabel: {
    id: 'app.audio.listenOnly.backLabel',
    defaultMessage: 'Back',
  },
  closeLabel: {
    id: 'app.audio.listenOnly.closeLabel',
    defaultMessage: 'Close',
  },
});

class ListenOnly extends React.Component {
  constructor(props) {
    super(props);

    this.chooseAudio = this.chooseAudio.bind(this);
    this.handleOutputChange = this.handleOutputChange.bind(this);
    this.handleClose = this.handleClose.bind(this);

    this.state = {
      inputDeviceId: undefined,
    };
  }

  chooseAudio() {
    this.props.changeMenu(this.props.JOIN_AUDIO);
  }

  handleOutputChange(deviceId) {
    console.log(`OUTPUT DEVICE CHANGED: ${deviceId}`);
  }

  handleClose() {
    this.setState({ isOpen: false });
    clearModal();
  }

  render() {
    const {
      intl
    } = this.props;

    return (
      <div>
        <div className={styles.center}>
          <Button className={styles.backBtn}
            label={intl.formatMessage(intlMessages.backLabel)}
            icon={'left-arrow'}
            size={'md'}
            color={'primary'}
            ghost={true}
            onClick={this.chooseAudio}
          />
          <Button className={styles.closeBtn}
            label={intl.formatMessage(intlMessages.closeLabel)}
            icon={'close'}
            size={'lg'}
            circle={true}
            hideLabel={true}
            onClick={this.handleClose}
          />
          <div>
            Choose your listen only settings
          </div>
        </div>
        <div>
          <div className={styles.containerLeftHalfContent}>
            <DeviceSelector
              className={styles.item}
              kind="audiooutput"
              onChange={this.handleOutputChange} />
            <AudioTestContainer />
          </div>
          <div className={styles.containerRightHalfContent}>
            <EnterAudioContainer isFullAudio={false}/>
          </div>
        </div>
      </div>
    );
  }
};

export default injectIntl(ListenOnly);
