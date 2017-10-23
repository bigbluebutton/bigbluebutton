import React from 'react';
import styles from './styles.scss';
import EmojiContainer from './emoji-menu/container';
import ActionsDropdown from './actions-dropdown/component';
import JoinAudioOptionsContainer from '../audio/audio-menu/container';
import MuteAudioContainer from './mute-button/container';

const ActionsBar = ({
  isUserPresenter,
  handleOpenJoinAudio,
  handleExitAudio,
}) => (
  <div className={styles.actionsbar}>
    <div className={styles.left}>
      <ActionsDropdown {...{ isUserPresenter }} />
    </div>
    <div className={styles.center}>
      <MuteAudioContainer />
      <JoinAudioOptionsContainer
        handleJoinAudio={handleOpenJoinAudio}
        handleCloseAudio={handleExitAudio}
      />
      {/* <JoinVideo />*/}
      <EmojiContainer />
    </div>
  </div>
);

export default ActionsBar;
