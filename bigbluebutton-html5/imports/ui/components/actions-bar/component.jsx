import React from 'react';
import styles from './styles.scss';
import EmojiContainer from './emoji-menu/container';
import ActionsDropdown from './actions-dropdown/component';
import AudioControlsContainer from '../audio/audio-controls/container';

const ActionsBar = ({
  isUserPresenter,
}) => (
  <div className={styles.actionsbar}>
    <div className={styles.left}>
      <ActionsDropdown {...{ isUserPresenter }} />
    </div>
    <div className={styles.center}>
      <AudioControlsContainer />
      {/* <JoinVideo /> */}
      <EmojiContainer />
    </div>
  </div>
);

export default ActionsBar;
