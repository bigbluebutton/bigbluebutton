import React, { Component, PropTypes } from 'react';
import Button from '/imports/ui/components/button/component';
import styles from './styles.scss';
import EmojiContainer from './emoji-menu/container';
import ActionsDropdown from './actions-dropdown/component';
import JoinAudioOptionsContainer from './audio-menu/container';
import MuteAudioContainer from './mute-button/container';
import JoinVideo from './video-button/component';
import cx from 'classnames';

export default class ActionsBar extends Component {
  constructor(props) {
    super(props);
  }

  renderCenterBtns() {
    const { isUserPresenter } = this.props;

    let centerContent;

    let positionClasses = {};
    positionClasses[styles.relative] = !isUserPresenter;
    positionClasses[styles.absolute] = isUserPresenter;

    if (isUserPresenter || !isUserPresenter) {
      centerContent = (
        <div className={cx(positionClasses)}>
          <MuteAudioContainer />
          <JoinAudioOptionsContainer
            handleJoinAudio={this.props.handleOpenJoinAudio}
            handleCloseAudio={this.props.handleExitAudio}

          />
          {/*<JoinVideo />*/}
          <EmojiContainer />
        </div>
      );
    }

    return centerContent;
  }

  render() {
    const { isUserPresenter } = this.props;

    return (
      <div className={styles.actionsbar}>
        <div className={styles.left}>
          <ActionsDropdown {...{isUserPresenter}}/>
        </div>
        {this.renderCenterBtns()}
      </div>
    );
  }
}
