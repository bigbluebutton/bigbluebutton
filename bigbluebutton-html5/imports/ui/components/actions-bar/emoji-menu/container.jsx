import React from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';

import EmojiService from './service';
import EmojiMenu from './component';

const propTypes = {
  // Emoji status of the current user
  userEmojiStatus: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
};

const EmojiContainer = ({ userEmojiStatus, actions }) => (
  <EmojiMenu userEmojiStatus={userEmojiStatus} actions={actions} />
);

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
