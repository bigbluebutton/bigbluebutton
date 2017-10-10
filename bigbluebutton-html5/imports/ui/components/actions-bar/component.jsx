import React, { Component } from 'react';
import styles from './styles.scss';
import EmojiContainer from './emoji-menu/container';
import ActionsDropdown from './actions-dropdown/component';
import JoinAudioOptionsContainer from '../audio/audio-menu/container';
import JoinVideoOptionsContainer from '../video-dock/video-menu/container';
import MuteAudioContainer from './mute-button/container';

export default class ActionsBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { isUserPresenter, handleShareScreen } = this.props;

    return (
      <div className={styles.actionsbar}>
        <div className={styles.left}>
          <ActionsDropdown {...{ isUserPresenter, handleShareScreen }} />
        </div>
        <div className={styles.center}>
          <MuteAudioContainer />
          <JoinAudioOptionsContainer
            handleJoinAudio={this.props.handleOpenJoinAudio}
            handleCloseAudio={this.props.handleExitAudio}
          />
          <JoinVideoOptionsContainer
            handleJoinVideo={this.props.handleJoinVideo}
            handleCloseVideo={this.props.handleExitVideo}
          />
          <EmojiContainer />
        </div>
      </div>
    );
  }
}
