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

  renderMuteButton() {
    return (<MuteAudioContainer />);
  }

  renderActionsButton() {
    return (<ActionsDropdown />);
  }

  renderStatusButton() {
    return (<EmojiContainer />);
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
          {this.renderActionsButton()}
        </div>
        <div className={styles.center}>
          {this.renderMuteButton()}
          {this.renderAudioButton()}
          {/*<JoinVideo />*/}
          {this.renderStatusButton()}
        </div>
        <div className={styles.right} style={{visibility: 'hidden'}}>
          {this.renderActionsButton()}
        </div>
      </div>
    );
  }

  nonVoicePresenter() {
    return (
      <div className={styles.actionsbar}>
        <div className={styles.left}>
          {this.renderActionsButton()}
        </div>
        <div className={styles.center}>
          {this.renderAudioButton()}
          {/*<JoinVideo />*/}
          {this.renderStatusButton()}
        </div>
        <div className={styles.right} style={{visibility: 'hidden'}}>
          {this.renderActionsButton()}
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
          {this.renderStatusButton()}
        </div>
      </div>
    );
  }

  voiceUser() {
    return (
      <div className={styles.actionsbar}>
        <div className={styles.center}>
          {this.renderMuteButton()}
          {this.renderAudioButton()}
          {/*<JoinVideo />*/}
          {this.renderStatusButton()}
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
