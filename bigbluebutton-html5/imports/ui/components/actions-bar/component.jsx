import React, { Component, PropTypes } from 'react';
import { showModal } from '/imports/ui/components/app/service';
import Audio from '/imports/ui/components/audio-modal/component';
import Button from '/imports/ui/components/button/component';
import styles from './styles.scss';
import EmojiContainer from './emoji-menu/container';
import ActionsDropdown from './actions-dropdown/component';
import Auth from '/imports/ui/services/auth/index';
import Users from '/imports/api/users/index';
import JoinAudioContainer from './audio-menu/container';
import { exitAudio } from '/imports/api/phone';

const openJoinAudio = () => {showModal(<Audio />)};

export default class ActionsBar extends Component {
  constructor(props) {
    super(props);
  }

  handleClick() {
  }

  renderForPresenter() {
    return (
      <div className={styles.actionsbar}>
        <div className={styles.left}>
          <ActionsDropdown />
        </div>
        <div className={styles.center}>
          <JoinAudioContainer
            open={openJoinAudio.bind(this)}
            close={exitAudio}
          />

          <Button
            onClick={this.handleClick}
            label={'Cam Off'}
            color={'primary'}
            icon={'video-off'}
            size={'lg'}
            circle={true}
          />
          <EmojiContainer />
        </div>
        <div className={styles.right}>
        </div>
      </div>
    );
  }

  renderForUser() {
    return (
      <div className={styles.actionsbar}>
        <div className={styles.center}>
          <JoinAudioContainer
            open={openJoinAudio.bind(this)}
            close={exitAudio}
          />

          <Button
            onClick={this.handleClick}
            label={'Cam Off'}
            color={'primary'}
            icon={'video-off'}
            size={'lg'}
            circle={true}
          />
          <EmojiContainer />
        </div>
        <div className={styles.right}>
        </div>
      </div>
    );
  }

  render() {
    const { isUserPresenter } = this.props;
    return(
      <div>
        {isUserPresenter ? this.renderForPresenter() : this.renderForUser()}
      </div>
    );
  }
}
