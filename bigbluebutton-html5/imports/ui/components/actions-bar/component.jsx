import React, { Component, PropTypes } from 'react';
import { showModal } from '/imports/ui/components/app/service';
import Audio from '/imports/ui/components/audio-modal/component';
import Button from '/imports/ui/components/button/component';
import styles from './styles.scss';
import EmojiContainer from './emoji-menu/container';
import ActionsDropdown from './actions-dropdown/component';
import Auth from '/imports/ui/services/auth/index';
import Users from '/imports/api/users/index';
import JoinAudioOptionsContainer from './audio-menu/container';
import MuteAudioContainer from './mute-button/container';
import { exitAudio } from '/imports/api/phone';
import JoinVideo from './video-button/component';

export default class ActionsBar extends Component {
  constructor(props) {
    super(props);
  }

  openJoinAudio() {
    return showModal(<Audio handleJoinListenOnly={this.props.handleJoinListenOnly} />)
  }

  voicePresenter() {
    return (
      <div className={styles.actionsbar}>
        <div className={styles.left}>
          <ActionsDropdown />
        </div>
        <div className={styles.center}>
          <MuteAudioContainer />
          <JoinAudioOptionsContainer
            open={this.openJoinAudio.bind(this)}
            close={() => {exitAudio();}}

          />
          {/*<JoinVideo />*/}
          <EmojiContainer />
        </div>
        <div className={styles.right} style={{visibility: 'hidden'}}>
          <ActionsDropdown />
        </div>
      </div>
    );
  }

  nonVoicePresenter() {
    return (
      <div className={styles.actionsbar}>
        <div className={styles.left}>
          <ActionsDropdown />
        </div>
        <div className={styles.center}>
          <JoinAudioOptionsContainer
            open={this.openJoinAudio.bind(this)}
            close={() => {exitAudio();}}
          />
          {/*<JoinVideo />*/}
          <EmojiContainer />
        </div>
        <div className={styles.right} style={{visibility: 'hidden'}}>
          <ActionsDropdown />
        </div>
      </div>
    );
  }

  nonVoiceUser() {
    return (
      <div className={styles.actionsbar}>
        <div className={styles.center}>
          <JoinAudioOptionsContainer
            open={this.openJoinAudio.bind(this)}
            close={() => {exitAudio();}}
          />
          {/*<JoinVideo />*/}
          <EmojiContainer />
        </div>
        <div className={styles.right}>
        </div>
      </div>
    );
  }

  voiceUser() {
    return (
      <div className={styles.actionsbar}>
        <div className={styles.center}>
          <MuteAudioContainer />
          <JoinAudioOptionsContainer
            open={this.openJoinAudio.bind(this)}
            close={() => {exitAudio();}}
          />
          {/*<JoinVideo />*/}
          <EmojiContainer />
        </div>
        <div className={styles.right}>
        </div>
      </div>
    );
  }

  renderForPresenter(isInVoiceAudio) {
    if (isInVoiceAudio) {
      return this.voicePresenter();
    }else{
      return this.nonVoicePresenter();
    }
  }

  renderForUser(isInVoiceAudio) {
    if (isInVoiceAudio) {
      return this.voiceUser();
    }else{
      return this.nonVoiceUser();
    }
  }

  render() {
    const { isUserPresenter, isInVoiceAudio } = this.props;

    return isUserPresenter ?
      this.renderForPresenter(isInVoiceAudio) :
      this.renderForUser(isInVoiceAudio);
  }
}
