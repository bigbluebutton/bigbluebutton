import React, { Component, PropTypes } from 'react';
import styles from './styles.scss';

import Button from '../button/component';
import EmojiContainer from './emoji-menu/container';

import ActionsDropdown from './actions-dropdown/component';

export default class ActionsBar extends Component {
  constructor(props) {
    super(props);
  }

  handleClick() {
  }

  render() {
    return (
      <div className={styles.actionsbar}>
        <div className={styles.left}>
          <ActionsDropdown />
        </div>
        <div className={styles.center}>
          <Button
            onClick={this.handleClick}
            label={'Mute'}
            color={'primary'}
            icon={'audio'}
            size={'lg'}
            circle={true}
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
}
