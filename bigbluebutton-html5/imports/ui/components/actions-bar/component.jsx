import React, { PureComponent } from 'react';
import cx from 'classnames';
import { defineMessages, intlShape, injectIntl } from 'react-intl';
import { styles } from './styles.scss';
import DesktopShare from './desktop-share/component';
import ActionsDropdown from './actions-dropdown/component';
import QuickPollDropdown from './quick-poll-dropdown/component';
import AudioControlsContainer from '../audio/audio-controls/container';
import JoinVideoOptionsContainer from '../video-provider/video-button/container';
import CaptionsButtonContainer from '/imports/ui/components/actions-bar/captions/container';
import PresentationOptionsContainer from './presentation-options/component';
import Button from '/imports/ui/components/button/component';
import TalkingIndicatorContainer from '/imports/ui/components/nav-bar/talking-indicator/container';
import VideoService from '/imports/ui/components/video-provider/service';

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
      toggleSwapLayout,
      handleTakePresenter,
      intl,
      currentSlidHasContent,
      parseCurrentSlideContent,
      isSharingVideo,
      screenShareEndAlert,
      stopExternalVideoShare,
      screenshareDataSavingSetting,
      isCaptionsAvailable,
      isMeteorConnected,
      isPollingEnabled,
      isThereCurrentPresentation,
      allowExternalVideo,
      inAudio,
      handleLeaveAudio,
      handleJoinAudio,
    } = this.props;

    const actionBarClasses = {};

    let joinIcon = 'audio_off';
    let endCall = false;
    if (inAudio) {
      joinIcon = 'audio_on';
      endCall = true;
    }

    actionBarClasses[styles.centerWithActions] = amIPresenter;
    actionBarClasses[styles.center] = true;
    actionBarClasses[styles.mobileLayoutSwapped] = isLayoutSwapped && amIPresenter;

    return (
      <div>
        <div className={cx(actionBarClasses)}>
          <div className={styles.actionsController}>
            <AudioControlsContainer />
            {enableVideo
              ? (
                <JoinVideoOptionsContainer
                  handleJoinVideo={handleJoinVideo}
                  handleCloseVideo={handleExitVideo}
                />
              )
              : null}
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
          <div className={styles.liveActions}>
            <div className={styles.dummyImage}>

              <img src="https://miro.medium.com/max/560/1*MccriYX-ciBniUzRKAUsAw.png" alt="" />
              <img
                src="https://lh3.googleusercontent.com/FPUDI5HXBwHwoy-_aEh9fAW7lkOCJdRNktzstpsWCTrCFN1Vj6sCh4sTjE4ZpYG1hZ6b"
                alt=""
              />
              <img src="https://miro.medium.com/max/560/1*MccriYX-ciBniUzRKAUsAw.png" alt="" />
            </div>
            <div className={styles.talkingIndicator}>
              <TalkingIndicatorContainer amIModerator={amIModerator} />
            </div>
          </div>
          {isCaptionsAvailable
            ? (
              <CaptionsButtonContainer {...{ intl }} />
            )
            : null
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
              size="xl"
              circle
            />
          </div>
          {/* {isPollingEnabled
            ? (
              <QuickPollDropdown
                {...{
                  currentSlidHasContent,
                  intl,
                  amIPresenter,
                  parseCurrentSlideContent,
                }}
              />
            ) : null
          } */}
          <div className={styles.right}>
            {isLayoutSwapped
              ? (
                <PresentationOptionsContainer
                  toggleSwapLayout={toggleSwapLayout}
                  isThereCurrentPresentation={isThereCurrentPresentation}
                />
              )
              : null
            }
          </div>
        </div>
      </div>
    );
  }
}

export default ActionsBar;
