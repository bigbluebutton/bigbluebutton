import React, { Component, PropTypes } from 'react';
import { showModal } from '/imports/ui/components/app/service';
import Audio from '/imports/ui/components/audio-modal/component';
import Button from '/imports/ui/components/button/component';
import styles from './styles.scss';
import Auth from '/imports/ui/services/auth/index';
import Users from '/imports/api/users/index';
import JoinAudioOptionsContainer from './audio-menu/container';

import { exitAudio } from '/imports/api/phone';
import JoinVideo from './video-button/component';

export default class ActionsBar extends Component {
  constructor(props) {
    super(props);
  }

  openJoinAudio() {
    return showModal(<Audio handleJoinListenOnly={this.props.handleJoinListenOnly} />)
  }

  renderAudioButton() {
    return (
      <JoinAudioOptionsContainer
        open={this.openJoinAudio.bind(this)}
        close={() => {exitAudio();}}
      />
    );
  }

  voicePresenter() {
    return (
      <div className={styles.actionsbar}>
        <div className={styles.left}>
          {this.props.actionsButton}
        </div>
        <div className={styles.center}>
          {this.props.muteButton}
          {this.renderAudioButton()}
          {/*<JoinVideo />*/}
          {this.props.emojiButton}
        </div>
        <div className={styles.right} style={{visibility: 'hidden'}}>
          {this.props.actionsButton}
        </div>
      </div>
    );
  }

  nonVoicePresenter() {
    return (
      <div className={styles.actionsbar}>
        <div className={styles.left}>
          {this.props.actionsButton}
        </div>
        <div className={styles.center}>
          {this.renderAudioButton()}
          {/*<JoinVideo />*/}
          {this.props.emojiButton}
        </div>
        <div className={styles.right} style={{visibility: 'hidden'}}>
          {this.props.actionsButton}
        </div>
      </div>
    );
  }

  nonVoiceUser() {
    return (
      <div className={styles.actionsbar}>
        <div className={styles.center}>
          {this.renderAudioButton()}
          {/*<JoinVideo />*/}
          {this.props.emojiButton}
        </div>
      </div>
    );
  }

  voiceUser() {
    return (
      <div className={styles.actionsbar}>
        <div className={styles.center}>
          {this.props.muteButton}
          {this.renderAudioButton()}
          {/*<JoinVideo />*/}
          {this.props.emojiButton}
        </div>
      </div>
    );
  }

  renderForPresenter(isInVoiceAudio) {
    return isInVoiceAudio ? this.voicePresenter() : this.nonVoicePresenter();
  }

  renderForUser(isInVoiceAudio) {
    return isInVoiceAudio ? this.voiceUser() : this.nonVoiceUser();
  }

  render() {
    const { isUserPresenter, isInVoiceAudio } = this.props;

    return isUserPresenter ?
      this.renderForPresenter(isInVoiceAudio) :
      this.renderForUser(isInVoiceAudio);
  }
}
