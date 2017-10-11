const EMOJI_STATUSES = {
  away: 'away',
  raiseHand: 'raiseHand',
  neutral: 'neutral',
  confused: 'confused',
  sad: 'sad',
  happy: 'happy',
  applause: 'applause',
  thumbsUp: 'thumbsUp',
  thumbsDown: 'thumbsDown',
  none: 'none',
};

const EMOJI_NORMALIZE = {
  away: 'time',
  raiseHand: 'hand',
  neutral: 'undecided',
  confused: 'confused',
  sad: 'sad',
  happy: 'happy',
  applause: 'applause',
  thumbsUp: 'thumbs_up',
  thumbsDown: 'thumbs_down',
};

export { EMOJI_STATUSES, EMOJI_NORMALIZE };
