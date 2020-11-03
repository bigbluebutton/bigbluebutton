import React, { Component } from 'react';

import DesktopShare from './DesktopShare';
import AudioControlsContainer from '../audio/audio-controls/AudioControlsContainer';
import JoinVideoOptionsContainer from '../video-provider/video-button/VideoButtonContainer';
import VideoProviderContainer from '../video-provider/container';
import { withModalMounter } from '/imports/ui/components/modal/service';
import getFromUserSettings from '/imports/ui/services/users-settings';
import RecordIndicatorContainer from '../RecordIndicator';
import UserListContainer from '../UserList';


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
          <RecordIndicatorContainer
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
          <UserListContainer />
          {/* <UserAvatar
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
          /> */}
        </div>
      </div>
    );
  }
}

export default withModalMounter(FooterView);
