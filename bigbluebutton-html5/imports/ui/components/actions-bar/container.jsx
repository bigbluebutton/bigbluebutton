import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ActionsBar from './component';
import Service from './service';

const ActionsBarContainer = props => <ActionsBar {...props} />;

export default createContainer(() => ({
  isUserPresenter: Service.isUserPresenter(),
  emojiList: Service.getEmojiList(),
  emojiSelected: Service.getEmoji(),
  handleEmojiChange: Service.setEmoji,
}), ActionsBarContainer);
