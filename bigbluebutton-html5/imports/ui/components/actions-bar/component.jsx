import React from 'react';
import cx from 'classnames';
import { styles } from './styles.scss';
import EmojiSelect from './emoji-select/component';
import ActionsDropdown from './actions-dropdown/component';
import AudioControlsContainer from '../audio/audio-controls/container';
import JoinVideoOptionsContainer from '../video-dock/video-menu/container';

class ActionsBar extends React.PureComponent {
  render() {
    const {
      isUserPresenter,
      handleExitVideo,
      handleJoinVideo,
      handleShareScreen,
      handleUnshareScreen,
      isVideoBroadcasting,
      emojiList,
      emojiSelected,
      handleEmojiChange,
    } = this.props;

    const actionBarClasses = {};
    actionBarClasses[styles.centerWithActions] = isUserPresenter;
    actionBarClasses[styles.center] = true;

    return (
      <div className={styles.actionsbar}>
        <div className={styles.left}>
          <ActionsDropdown {...{
            isUserPresenter,
            handleShareScreen,
            handleUnshareScreen,
            isVideoBroadcasting,
            }}
          />
        </div>
        <div className={isUserPresenter ? cx(styles.centerWithActions, actionBarClasses) : styles.center}>
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
  }
}

export default ActionsBar;
