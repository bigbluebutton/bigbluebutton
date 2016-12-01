import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import EmojiService from './service';
import EmojiMenu from './component.jsx';

const propTypes = {
  // Emoji status of the current user
  userEmojiStatus: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
};

class EmojiContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      userEmojiStatus,
      actions,
    } = this.props;

    return (
      <EmojiMenu userEmojiStatus={userEmojiStatus} actions={actions}/>
    );
  }
}

export default createContainer(() => {
  const data = EmojiService.getEmojiData();

  const {
    userEmojiStatus,
    credentials,
  } = data;

  const { requesterUserId: userId } = credentials;

  return {
    userEmojiStatus,
    actions: {
      setEmojiHandler: (status) => {
        EmojiService.setEmoji(userId, status);
      },
    },
  };
}, EmojiContainer);

EmojiContainer.propTypes = propTypes;
