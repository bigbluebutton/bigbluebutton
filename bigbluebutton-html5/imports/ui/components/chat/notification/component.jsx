import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ChatAudioNotification from './audio-notification/component';
import ChatPushNotification from './push-notification/component';

const propTypes = {
  disableNotify: PropTypes.bool.isRequired,
  openChats: PropTypes.arrayOf(PropTypes.object).isRequired,
  disableAudio: PropTypes.bool.isRequired,
};

class ChatNotification extends Component {
  constructor(props) {
    super(props);
    this.state = { notified: {} };
  }

  componentWillReceiveProps(nextProps) {
    const {
      openChats,
      disableNotify,
    } = this.props;

    if (nextProps.disableNotify === false && disableNotify === true) {
      const loadMessages = {};
      openChats
        .forEach((c) => {
          loadMessages[c.id] = c.unreadCounter;
        });
      this.setState({ notified: loadMessages });
      return;
    }

    const notifiedToClear = {};
    openChats
      .filter(c => c.unreadCounter === 0)
      .forEach((c) => {
        notifiedToClear[c.id] = 0;
      });

    this.setState(({ notified }) => ({
      notified: {
        ...notified,
        ...notifiedToClear,
      },
    }));
  }

  render() {
    const {
      disableNotify,
      disableAudio,
      openChats,
    } = this.props;

    const unreadMessagesCount = openChats
      .map(chat => chat.unreadCounter)
      .reduce((a, b) => a + b, 0);

    const shouldPlayAudio = !disableAudio && unreadMessagesCount > 0;

    const chatsNotify = openChats
      .filter(({ id, unreadCounter }) =>
        unreadCounter > 0 &&
        unreadCounter !== this.state.notified[id] &&
        !disableNotify);

    return (
      <span>
        <ChatAudioNotification play={shouldPlayAudio} count={unreadMessagesCount} />
        {
          chatsNotify.map(({ id, name, unreadCounter }) =>
            (<ChatPushNotification
              key={id}
              name={name}
              count={unreadCounter}
              onOpen={() => {
                this.setState(({ notified }) => ({
                  notified: {
                    ...notified,
                    [id]: unreadCounter,
                  },
                }));
              }}
            />))
        }
      </span>
    );
  }
}
ChatNotification.propTypes = propTypes;

export default ChatNotification;
