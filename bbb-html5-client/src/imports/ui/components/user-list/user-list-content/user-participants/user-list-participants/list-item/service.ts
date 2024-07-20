import { EMOJI_STATUSES } from '/imports/utils/statuses';

const normalizeEmojiName = (emoji: string) => {
  const statusAvailable = (Object.keys(EMOJI_STATUSES).includes(emoji));

  return statusAvailable ? (EMOJI_STATUSES as Record<string, string>)[emoji] : emoji;
};

export default normalizeEmojiName;
