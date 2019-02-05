import React from 'react';
import cx from 'classnames';
import { styles } from './styles.scss';
import DesktopShare from './desktop-share/component';
import ActionsDropdown from './actions-dropdown/component';
import AudioControlsContainer from '../audio/audio-controls/container';
import JoinVideoOptionsContainer from '../video-provider/video-button/container';

import PresentationOptionsContainer from './presentation-options/component';

class ActionsBar extends React.PureComponent {
  render() {
    const {
      isUserPresenter,
      handleExitVideo,
      handleJoinVideo,
      handleShareScreen,
      handleUnshareScreen,
      isVideoBroadcasting,
      isUserModerator,
      recordSettingsList,
      toggleRecording,
      screenSharingCheck,
      enableVideo,
      createBreakoutRoom,
      meetingIsBreakout,
      hasBreakoutRoom,
      meetingName,
      users,
      isLayoutSwapped,
      toggleSwapLayout,
      getUsersNotAssigned,
      sendInvitation,
      getBreakouts,
      handleTakePresenter,
    } = this.props;

    const {
      allowStartStopRecording,
      recording: isRecording,
      record,
    } = recordSettingsList;

    const actionBarClasses = {};
    const { enableExternalVideo } = Meteor.settings.public.app;

    actionBarClasses[styles.centerWithActions] = isUserPresenter;
    actionBarClasses[styles.center] = true;

    return (
      <div className={styles.actionsbar}>
        <div className={styles.left}>
          <ActionsDropdown {...{
            isUserPresenter,
            isUserModerator,
            allowStartStopRecording,
            allowExternalVideo: enableExternalVideo,
            isRecording,
            record,
            toggleRecording,
            createBreakoutRoom,
            meetingIsBreakout,
            hasBreakoutRoom,
            meetingName,
            users,
            getUsersNotAssigned,
            sendInvitation,
            getBreakouts,
            handleTakePresenter,
          }}
          />
        </div>
        <div
          className={
            isUserPresenter ? cx(styles.centerWithActions, actionBarClasses) : styles.center
          }
        >
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
            isUserPresenter,
            screenSharingCheck,
          }}
          />
        </div>
        <div className={styles.right}>
          { isLayoutSwapped
            ? (
              <PresentationOptionsContainer
                toggleSwapLayout={toggleSwapLayout}
              />
            )
            : null
          }
        </div>
      </div>
    );
  }
}

export default ActionsBar;
