import React, { Component, PropTypes } from 'react';
import styles from './styles.scss';
import Chats from '/imports/api/chat';

import ChatsService from '/imports/ui/components/chat/service';

import Button from '../button/component';

export default class ActionsBar extends Component {
  constructor(props) {
    super(props);
  }

  handleClick() {
    const SYSTEM_CHAT_TYPE = 'SYSTEM_MESSAGE';
    const PUBLIC_CHAT_TYPE = 'PUBLIC_CHAT';
    const PRIVATE_CHAT_TYPE = 'PRIVATE_CHAT';

    console.log(Chats.find({
      'message.chat_type': { $in: [PUBLIC_CHAT_TYPE, SYSTEM_CHAT_TYPE] },
    }, {
      sort: ['message.from_time'],
    })
    .fetch());
  }

  handleClick2() {
    console.log(ChatsService.getPublicMessages());
  }

  render() {
    return (
      <div className={styles.actionsbar}>
        <div className={styles.left}>
          <Button
            onClick={this.handleClick}
            label={'Actions'}
            color={'primary'}
            icon={'circle-add'}
            size={'lg'}
            circle={true}
          />
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
            onClick={this.handleClick2}
            label={'Cam Off'}
            color={'primary'}
            icon={'video-off'}
            size={'lg'}
            circle={true}
          />
          <Button
            onClick={this.handleClick}
            label={'Raise'}
            color={'primary'}
            icon={'hand'}
            size={'lg'}
            circle={true}
          />
        </div>
        <div className={styles.right}>
        </div>
      </div>
    );
  }
}
