import React from 'react';
import styles from './styles.scss';
import EmojiSelect from './emoji-select/component';
import ActionsDropdown from './actions-dropdown/component';
import AudioControlsContainer from '../audio/audio-controls/container';

const ActionsBar = ({
  isUserPresenter,
  emojiList,
  emojiSelected,
  handleEmojiChange,
}) => (
  <div className={styles.actionsbar}>
    <div className={styles.left}>
      <ActionsDropdown {...{ isUserPresenter }} />
    </div>
    <div className={styles.center}>
      <AudioControlsContainer />
      {/* <JoinVideo /> */}
      <EmojiSelect options={emojiList} selected={emojiSelected} onChange={handleEmojiChange} />
    </div>
  </div>
);

export default ActionsBar;
