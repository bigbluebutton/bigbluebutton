import React, { Component } from 'react';
import styles from './styles.scss';
import EmojiContainer from './emoji-menu/container';
import ActionsDropdown from './actions-dropdown/component';
import JoinAudioOptionsContainer from '../audio/audio-menu/container';
import MuteAudioContainer from './mute-button/container';

export default class ActionsBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { isUserPresenter } = this.props;

    return (
      <div className={styles.actionsbar}>
        <div className={styles.left}>
          <ActionsDropdown {...{ isUserPresenter }} />
        </div>
        <div className={styles.center}>
          <MuteAudioContainer />
          <JoinAudioOptionsContainer
            handleJoinAudio={this.props.handleOpenJoinAudio}
            handleCloseAudio={this.props.handleExitAudio}
          />
          {/* <JoinVideo />*/}
          <EmojiContainer />
        </div>
      </div>
    );
  }
}
