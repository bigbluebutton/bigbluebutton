import React, { Component } from 'react';

import DesktopShare from './DesktopShare';
import AudioControlsContainer from '../audio/audio-controls/AudioControlsContainer';
import JoinVideoOptionsContainer from '../video-provider/video-button/VideoButtonContainer';
import { IconButton } from '../common';
import UserAvatar from '../UserAvatar';
import VideoProviderContainer from '../video-provider/container';
import RecordingIndicatorContainer from '../RecordIndicator';
import { withModalMounter } from '/imports/ui/components/modal/service';
import getFromUserSettings from '/imports/ui/services/users-settings';


class FooterView extends Component {
  componentDidMount() {
    const {
      processOutsideToggleRecording,
      connectRecordingObserver,
    } = this.props;

    if (Meteor.settings.public.allowOutsideCommands.toggleRecording
      || getFromUserSettings('bbb_outside_toggle_recording', false)) {
      connectRecordingObserver();
      window.addEventListener('message', processOutsideToggleRecording);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const {
      amIPresenter,
      handleShareScreen,
      handleUnshareScreen,
      isVideoBroadcasting,
      screenSharingCheck,
      screenShareEndAlert,
      screenshareDataSavingSetting,
      isMeteorConnected,
      enableVideo,
      mountModal,
      amIModerator,
    } = this.props;

    return (
      <div id="footerBar" className="flex w-full">
        <div className="w-1/2 p-2 flex items-center">
          {enableVideo
            ? (
              <JoinVideoOptionsContainer />
            )
            : null}
          <AudioControlsContainer />
          {/* <IconButton
        color="secondary"
        icon="record"
      /> */}
          <RecordingIndicatorContainer
            mountModal={mountModal}
            amIModerator={amIModerator}
          />
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
        <div className="w-1/2 p-2 flex justify-end">
          <VideoProviderContainer swapLayout={false} />
          <UserAvatar
            avatar="images/user_1.png"
          />
          <UserAvatar
            avatar="images/user_2.png"
          />
          <UserAvatar
            avatar="images/user_3.png"
          />
          <UserAvatar
            avatar="images/user_4.png"
          />
        </div>
      </div>
    );
  }
}

export default withModalMounter(FooterView);
