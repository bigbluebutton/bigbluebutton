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
import NumberOfBreakouts from '../number of breakouts/component';

const MIN_BREAKOUT_ROOMS = 2;
const MAX_BREAKOUT_ROOMS = 8;


const propTypes = {
  intl: intlShape.isRequired,
  closeModal: PropTypes.func.isRequired,
  joinMicrophone: PropTypes.func.isRequired,
  joinListenOnly: PropTypes.func.isRequired,
  joinEchoTest: PropTypes.func.isRequired,
  exitAudio: PropTypes.func.isRequired,
  leaveEchoTest: PropTypes.func.isRequired,
  changeInputDevice: PropTypes.func.isRequired,
  changeOutputDevice: PropTypes.func.isRequired,
  isEchoTest: PropTypes.bool.isRequired,
  isConnecting: PropTypes.bool.isRequired,
  isConnected: PropTypes.bool.isRequired,
  inputDeviceId: PropTypes.string,
  outputDeviceId: PropTypes.string,
  formattedDialNum: PropTypes.string.isRequired,
  showPermissionsOvelay: PropTypes.bool.isRequired,
  listenOnlyMode: PropTypes.bool.isRequired,
  skipCheck: PropTypes.bool.isRequired,
  joinFullAudioImmediately: PropTypes.bool.isRequired,
  joinFullAudioEchoTest: PropTypes.bool.isRequired,
  forceListenOnlyAttendee: PropTypes.bool.isRequired,
  audioLocked: PropTypes.bool.isRequired,
  resolve: PropTypes.func,
  isMobileNative: PropTypes.bool.isRequired,
  isIOSChrome: PropTypes.bool.isRequired,
  isIEOrEdge: PropTypes.bool.isRequired,
  hasMediaDevices: PropTypes.bool.isRequired,
  formattedTelVoice: PropTypes.string.isRequired,
  autoplayBlocked: PropTypes.bool.isRequired,
  handleAllowAutoplay: PropTypes.func.isRequired,


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


    this.renderMobile = this.renderMobile.bind(this);
    this.renderErrorMessages = this.renderErrorMessages.bind(this);
    this.renderRoomSortList = this.renderRoomSortList.bind(this);


    this.state = {
    
      numberOfRooms: MIN_BREAKOUT_ROOMS,
      seletedId: '',
      users: [],
      durationTime: 15,
      freeJoin: false,
      formFillLevel: 1,
      roomSelected: 0,
      preventClosing: true,
      valid: true,
      record: false,
      numberOfRoomsIsValid: true,
        currentStep: 0,
       // numberOfRooms:  '',
        username: '',
        password: '',
        users:[],
    };

    console.log(this.props);
   
  }

  renderRoomSortList() {
    const { intl, isInvitation } = this.props;
    const { numberOfRooms } = this.state;
    const onClick = roomNumber => this.setState({ formFillLevel: 3, roomSelected: roomNumber });
    return (
      <div className={styles.listContainer}>
        <span>
          {
            new Array(numberOfRooms).fill(1).map((room, idx) => (
              <div className={styles.roomItem}>
                <h2 className={styles.itemTitle}>
                  {intl.formatMessage(intlMessages.breakoutRoomLabel, { 0: idx + 1 })}
                </h2>
                <Button
                  className={styles.itemButton}
                  label={intl.formatMessage(intlMessages.addParticipantLabel)}
                  size="lg"
                  ghost
                  color="primary"
                  onClick={() => onClick(idx + 1)}
                />
              </div>
            ))
          }
        </span>
        { isInvitation || this.renderButtonSetLevel(1, intl.formatMessage(intlMessages.backLabel))}
      </div>
    );
  }


  renderErrorMessages() {
    const {
      intl,
    } = this.props;
    const {
      valid,
      numberOfRoomsIsValid,
    } = this.state;
    return (
      <React.Fragment>
        {!valid
          && (
          <span className={styles.withError}>
            {intl.formatMessage(intlMessages.leastOneWarnBreakout)}
          </span>)}
        {!numberOfRoomsIsValid
          && (
          <span className={styles.withError}>
            {intl.formatMessage(intlMessages.numberOfRoomsIsValid)}
          </span>)}
      </React.Fragment>
    );
  }


  
  renderMobile() {
    const { intl } = this.props;
    const { formFillLevel } = this.state;
    if (formFillLevel === 2) {
      return [
        this.renderErrorMessages(),
        this.renderRoomSortList(),
      ];
    }

    if (formFillLevel === 3) {
      return [
        this.renderErrorMessages(),
        this.renderSelectUserScreen(),
      ];
    }

    return [
      this.renderErrorMessages(),
      this.renderBreakoutForm(),
      this.renderCheckboxes(),
      this.renderButtonSetLevel(2, intl.formatMessage(intlMessages.nextLabel)),
    ];
  }

  _next = () => {
    let currentStep = this.state.currentStep
    currentStep = currentStep >= 4? 5: currentStep + 1
    this.setState({
      currentStep: currentStep
    })
  }
    
  _prev = () => {
    let currentStep = this.state.currentStep
    currentStep = currentStep <= 0? 0: currentStep - 1
    this.setState({
      currentStep: currentStep
    })
  }

previousButton() {
  let currentStep = this.state.currentStep;
  if(currentStep !==0){
    return (
      <button 
        className={styles.pbtn}
        //className="btn btn-secondary" 
        type="button" onClick={this._prev}>
      Previous
      </button>
    )
  }
  return null;
}

nextButton(){
  let currentStep = this.state.currentStep;
  if(currentStep <5){
    return (
      <button 
        className={styles.nbtn}
       // className="btn btn-primary float-right" 
        type="button" onClick={this._next}>
      Next
      </button>        
    )
  }
  return(
    <button 
      className={styles.nbtn}
     // className="btn btn-primary float-right" 
      type="button" 
      //onClick={this._next}
      >
    Create
    </button>        
  );
}


  render() {
    let currentStep = this.state.currentStep;
    const {
      intl,
      showPermissionsOvelay,
      isIOSChrome,
      closeModal,
      isIEOrEdge,
      users,
    } = this.props;

    const { content  } = this.state;
   console.log(this.props);
    return (
      <span>
        {showPermissionsOvelay ? <PermissionsOverlay closeModal={closeModal} /> : null}
        <Modal
          overlayClassName={styles.overlay}
          className={styles.modal}
          onRequestClose={closeModal}
          hideBorder
        //  contentLabel={intl.formatMessage(intlMessages.ariaModalTitle)}
        >
        {/* <div> {this.renderMobile()}</div> */}

      <React.Fragment>
      {/* <h1>React Wizard Form 🧙‍♂️</h1> */}
      
      {/* <p>Step {this.state.currentStep} </p>  */}

      <form onSubmit={this.handleSubmit}>
       <NumberOfBreakouts
           users={this.props.users}
          currentStep={this.state.currentStep} 
          handleChange={this.handleChange}
          email={this.state.email}
        />
        <div className={styles.btns}>
        {this.nextButton()}
        {this.previousButton()}
        
        </div>
      </form>
      </React.Fragment>
        </Modal>
      </span>
    );
  }
}

AudioModal.propTypes = propTypes;
AudioModal.defaultProps = defaultProps;

export default injectIntl(AudioModal);
