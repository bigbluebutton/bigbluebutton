import React from 'react';
import { styles } from './styles.scss';
import EmojiSelect from './emoji-select/component';
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
  emojiList,
  emojiSelected,
  handleEmojiChange,
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
      <EmojiSelect options={emojiList} selected={emojiSelected} onChange={handleEmojiChange} />
    </div>
  </div>
);

export default ActionsBar;
