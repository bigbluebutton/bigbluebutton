export const emojiConfigs = {
  away: {
    icon: 'icon-bbb-time',
    intlId: 'app.actionsBar.emojiMenu.awayLabel',
    defaultMessage: 'Away',
  },
  neutral: {
    icon: 'icon-bbb-undecided',
    intlId: 'app.actionsBar.emojiMenu.neutralLabel',
    defaultMessage: 'Undecided',
  },
  confused: {
    icon: 'icon-bbb-confused',
    intlId: 'app.actionsBar.emojiMenu.confusedLabel',
    defaultMessage: 'Confused',
  },
  sad: {
    icon: 'icon-bbb-sad',
    intlId: 'app.actionsBar.emojiMenu.sadLabel',
    defaultMessage: 'Sad',
  },
  happy: {
    icon: 'icon-bbb-happy',
    intlId: 'app.actionsBar.emojiMenu.happyLabel',
    defaultMessage: 'Happy',
  },
  applause: {
    icon: 'icon-bbb-applause',
    intlId: 'app.actionsBar.emojiMenu.applauseLabel',
    defaultMessage: 'Applaud',
  },
  thumbsUp: {
    icon: 'icon-bbb-thumbs_up',
    intlId: 'app.actionsBar.emojiMenu.thumbsUpLabel',
    defaultMessage: 'Thumbs up',
  },
  thumbsDown: {
    icon: 'icon-bbb-thumbs_down',
    intlId: 'app.actionsBar.emojiMenu.thumbsDownLabel',
    defaultMessage: 'Thumbs down',
  },
  raiseHand: {
    icon: 'icon-bbb-hand',
    intlId: 'app.actionsBar.emojiMenu.raiseHandLabel',
    defaultMessage: 'Raise hand',
  },
};

export function getUserEmojisSummary(user, skipNames = null, start = null, end = null) {
  const userEmojis = {};
  user.emojis.forEach((emoji) => {
    if (typeof emojiConfigs[emoji.name] === 'undefined') return;
    if (skipNames != null && skipNames.split(',').indexOf(emoji.name) > -1) return;
    if (start != null && emoji.sentOn < start) return;
    if (end != null && emoji.sentOn > end) return;
    if (typeof userEmojis[emoji.name] === 'undefined') {
      userEmojis[emoji.name] = 0;
    }
    userEmojis[emoji.name] += 1;
  });
  return userEmojis;
}

export function filterUserEmojis(user, skipNames = null, start = null, end = null) {
  const userEmojis = [];
  user.emojis.forEach((emoji) => {
    if (typeof emojiConfigs[emoji.name] === 'undefined') return;
    if (skipNames != null && skipNames.split(',').indexOf(emoji.name) > -1) return;
    if (start != null && emoji.sentOn < start) return;
    if (end != null && emoji.sentOn > end) return;
    userEmojis.push(emoji);
  });
  return userEmojis;
}
