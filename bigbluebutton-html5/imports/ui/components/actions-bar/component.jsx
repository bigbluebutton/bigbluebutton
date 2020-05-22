import React, { PureComponent } from 'react';
import cx from 'classnames';
import { defineMessages } from 'react-intl';
import { styles } from './styles.scss';
import DesktopShare from './desktop-share/component';
import ActionsDropdown from './actions-dropdown/component';
import AudioControlsContainer from '../audio/audio-controls/container';
import JoinVideoOptionsContainer from '../video-provider/video-button/container';
import Button from '/imports/ui/components/button/component';
import TalkingIndicatorContainer from '/imports/ui/components/nav-bar/talking-indicator/container';
import Auth from '/imports/ui/services/auth';
import VideoProviderContainer from '/imports/ui/components/video-provider/container';

const intlMessages = defineMessages({
  joinAudio: {
    id: 'app.audio.joinAudio',
    description: 'Join audio button label',
  },
  leaveAudio: {
    id: 'app.audio.leaveAudio',
    description: 'Leave audio button label',
  },
  muteAudio: {
    id: 'app.actionsBar.muteLabel',
    description: 'Mute audio button label',
  },
  unmuteAudio: {
    id: 'app.actionsBar.unmuteLabel',
    description: 'Unmute audio button label',
  },
});

class ActionsBar extends PureComponent {
  render() {
    const {
      amIPresenter,
      handleExitVideo,
      handleJoinVideo,
      handleShareScreen,
      handleUnshareScreen,
      isVideoBroadcasting,
      amIModerator,
      screenSharingCheck,
      enableVideo,
      isLayoutSwapped,
      handleTakePresenter,
      intl,
      isSharingVideo,
      screenShareEndAlert,
      stopExternalVideoShare,
      screenshareDataSavingSetting,
      toggleChatLayout,
      isMeteorConnected,
      isPollingEnabled,
      allowExternalVideo,
      inAudio,
      handleLeaveAudio,
      handleJoinAudio,
      isThereCurrentPresentation,
      validateMeetingIsBreakout,
      isVideoStreamTransmitting,
      isSharingWebCam
    } = this.props;

    const actionBarClasses = {};

    let joinIcon = '';
    let endCall = false;
    if (inAudio) {
      joinIcon = 'icomoon-End-Call';
      endCall = true;
    }

    actionBarClasses[styles.centerWithActions] = amIPresenter;
    actionBarClasses[styles.center] = true;
    actionBarClasses[styles.mobileLayoutSwapped] = isLayoutSwapped && amIPresenter;

    if(!amIPresenter && isSharingWebCam){
      handleExitVideo();    
    }

    return (
      <div className={cx(actionBarClasses)}>
        <div className={!toggleChatLayout ? styles.actionsController : styles.toggledActions}>
          <AudioControlsContainer />
          <div>
            {enableVideo && amIPresenter && !validateMeetingIsBreakout(Auth.meetingID)
              ? (
                <JoinVideoOptionsContainer
                  handleJoinVideo={handleJoinVideo}
                  handleCloseVideo={handleExitVideo}
                />
              )
              : null}
          </div>
          <div>
            <DesktopShare {...{
              handleShareScreen,
              handleUnshareScreen,
              isVideoBroadcasting,
              amIPresenter,
              screenSharingCheck,
              screenShareEndAlert,
              isMeteorConnected,
              screenshareDataSavingSetting,
            }}
            />
          </div>
          <div>
            <ActionsDropdown {...{
              amIPresenter,
              amIModerator,
              isPollingEnabled,
              allowExternalVideo,
              handleTakePresenter,
              intl,
              isSharingVideo,
              stopExternalVideoShare,
              isMeteorConnected,
            }}
            />
          </div>
        </div>
      {toggleChatLayout ? null :
        <div className={styles.liveActions}>
          <div className={!toggleChatLayout ? styles.dummy1 : styles.dummy2}>

            <img src="https://miro.medium.com/max/560/1*MccriYX-ciBniUzRKAUsAw.png" alt="" />
         
            {
              (isVideoStreamTransmitting || isSharingWebCam)
                ? (
                  <VideoProviderContainer
                    swapLayout={false}
                  />
                )
                : null //should show avatar here
            }

            <img src="https://miro.medium.com/max/560/1*MccriYX-ciBniUzRKAUsAw.png" alt="" />
          </div>
          <div className={styles.talkingIndicator}>
            <TalkingIndicatorContainer amIModerator={amIModerator} />
          </div>
        </div>
      }
        <div className={styles.audioButton}>
          <Button
            className={cx(styles.button, inAudio, endCall ? styles.endingCall : null)}
            onClick={inAudio ? handleLeaveAudio : handleJoinAudio}
            hideLabel
            label={inAudio ? intl.formatMessage(intlMessages.leaveAudio)
              : intl.formatMessage(intlMessages.joinAudio)}
            color="default"
            ghost={!inAudio}
            icon={joinIcon}
            size={!toggleChatLayout ? 'xl' : 'lg'}
            circle
          />
        </div>
      </div>
    );
  }
}

export default ActionsBar;
