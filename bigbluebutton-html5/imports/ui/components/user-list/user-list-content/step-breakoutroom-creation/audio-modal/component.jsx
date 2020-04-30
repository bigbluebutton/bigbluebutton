import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Modal from '/imports/ui/components/modal/simple/component';
import Button from '/imports/ui/components/button/component';
import { Session } from 'meteor/session';
import {
  defineMessages, injectIntl, intlShape, FormattedMessage,
} from 'react-intl';
import { styles } from './styles';
import NumberOfBreakouts from '../number-of-breakouts/component';

const MIN_BREAKOUT_ROOMS = 2;
const MAX_BREAKOUT_ROOMS = 8;


const propTypes = {
  // intl: intlShape.isRequired,
  // closeModal: PropTypes.func.isRequired,
  // joinMicrophone: PropTypes.func.isRequired,
  // joinListenOnly: PropTypes.func.isRequired,
  // joinEchoTest: PropTypes.func.isRequired,
  // exitAudio: PropTypes.func.isRequired,
  // leaveEchoTest: PropTypes.func.isRequired,
  // changeInputDevice: PropTypes.func.isRequired,
  // changeOutputDevice: PropTypes.func.isRequired,
  // isEchoTest: PropTypes.bool.isRequired,
  // isConnecting: PropTypes.bool.isRequired,
  // isConnected: PropTypes.bool.isRequired,
  // inputDeviceId: PropTypes.string,
  // outputDeviceId: PropTypes.string,
  // formattedDialNum: PropTypes.string.isRequired,
  // showPermissionsOvelay: PropTypes.bool.isRequired,
  // listenOnlyMode: PropTypes.bool.isRequired,
  // skipCheck: PropTypes.bool.isRequired,
  // joinFullAudioImmediately: PropTypes.bool.isRequired,
  // joinFullAudioEchoTest: PropTypes.bool.isRequired,
  // forceListenOnlyAttendee: PropTypes.bool.isRequired,
  // audioLocked: PropTypes.bool.isRequired,
  // resolve: PropTypes.func,
  // isMobileNative: PropTypes.bool.isRequired,
  // isIOSChrome: PropTypes.bool.isRequired,
  // isIEOrEdge: PropTypes.bool.isRequired,
  // hasMediaDevices: PropTypes.bool.isRequired,
  // formattedTelVoice: PropTypes.string.isRequired,
  // autoplayBlocked: PropTypes.bool.isRequired,
  // handleAllowAutoplay: PropTypes.func.isRequired,


  users: PropTypes.arrayOf(PropTypes.object).isRequired,


};

const defaultProps = {
  inputDeviceId: null,
  outputDeviceId: null,
  resolve: null,
};

// const intlMessages = defineMessages({
//   microphoneLabel: {
//     id: 'app.audioModal.microphoneLabel',
//     description: 'Join mic audio button label',
//   },
//   listenOnlyLabel: {
//     id: 'app.audioModal.listenOnlyLabel',
//     description: 'Join listen only audio button label',
//   },
//   closeLabel: {
//     id: 'app.audioModal.closeLabel',
//     description: 'close audio modal button label',
//   },
//   audioChoiceLabel: {
//     id: 'app.audioModal.audioChoiceLabel',
//     description: 'Join audio modal title',
//   },
//   iOSError: {
//     id: 'app.audioModal.iOSBrowser',
//     description: 'Audio/Video Not supported warning',
//   },
//   iOSErrorDescription: {
//     id: 'app.audioModal.iOSErrorDescription',
//     description: 'Audio/Video not supported description',
//   },
//   iOSErrorRecommendation: {
//     id: 'app.audioModal.iOSErrorRecommendation',
//     description: 'Audio/Video recommended action',
//   },
//   echoTestTitle: {
//     id: 'app.audioModal.echoTestTitle',
//     description: 'Title for the echo test',
//   },
//   settingsTitle: {
//     id: 'app.audioModal.settingsTitle',
//     description: 'Title for the audio modal',
//   },
//   helpTitle: {
//     id: 'app.audioModal.helpTitle',
//     description: 'Title for the audio help',
//   },
//   audioDialTitle: {
//     id: 'app.audioModal.audioDialTitle',
//     description: 'Title for the audio dial',
//   },
//   connecting: {
//     id: 'app.audioModal.connecting',
//     description: 'Message for audio connecting',
//   },
//   connectingEchoTest: {
//     id: 'app.audioModal.connectingEchoTest',
//     description: 'Message for echo test connecting',
//   },
//   ariaModalTitle: {
//     id: 'app.audioModal.ariaTitle',
//     description: 'aria label for modal title',
//   },
//   autoplayPromptTitle: {
//     id: 'app.audioModal.autoplayBlockedDesc',
//     description: 'Message for autoplay audio block',
//   },
// });


class AudioModal extends Component {
  constructor(props) {
    super(props);

    this.state = {

    };

    console.log(this.props);
  }


  render() {
    const currentStep = this.state.currentStep;
    const {
      intl,
      showPermissionsOvelay,
      isIOSChrome,
      closeModal,
      isIEOrEdge,
      users,
    } = this.props;

    const { content } = this.state;
    console.log(this.props);
    return (
      <span>
        {showPermissionsOvelay ? <PermissionsOverlay closeModal={closeModal} /> : null}
        <Modal
          overlayClassName={styles.overlay}
          className={styles.modal}
          onRequestClose={closeModal}
          hideBorder

        >


          <React.Fragment>


            <NumberOfBreakouts />

          </React.Fragment>
        </Modal>
      </span>
    );
  }
}

AudioModal.propTypes = propTypes;
AudioModal.defaultProps = defaultProps;

export default injectIntl(AudioModal);
