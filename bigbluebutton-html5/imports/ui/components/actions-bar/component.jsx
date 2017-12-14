import React from 'react';
import styles from './styles.scss';
import EmojiContainer from './emoji-menu/container';
import ActionsDropdown from './actions-dropdown/component';
import AudioControlsContainer from '../audio/audio-controls/container';
import JoinVideoOptionsContainer from '../video-dock/video-menu/container';

const ActionsBar = ({
  isUserPresenter,
  handleExitVideo,
  handleJoinVideo,
  handleShareScreen,
  handleUnshareScreen,
  isVideoBroadcasting,
}) => (
  <div className={styles.actionsbar}>
    <div className={styles.left}>
      <ActionsDropdown {...{ isUserPresenter, handleShareScreen, handleUnshareScreen, isVideoBroadcasting}} />
    </div>
    <div className={styles.center}>
      <AudioControlsContainer />
      {Meteor.settings.public.kurento.enableVideo ?
        <JoinVideoOptionsContainer
          handleJoinVideo={handleJoinVideo}
          handleCloseVideo={handleExitVideo}
        />
      : null}
      <EmojiContainer />
    </div>
  </div>
);

export default ActionsBar;
