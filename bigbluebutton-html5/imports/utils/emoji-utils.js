import { getEmojiDataFromNative } from 'emoji-mart';

export const getAllShortCodes = async (shortcode) => {
  const shortcodes = [];

  const emoji = await getEmojiDataFromNative(shortcode);
  if (!emoji) return shortcodes;

  if (emoji.aliases && emoji.aliases.length > 0) {
    emoji.aliases.forEach((alias) => {
      if (!shortcodes.includes(alias)) {
        shortcodes.push(alias);
      }
    });
  }

  if (emoji.shortcodes && emoji.shortcodes.length > 0) {
    // shortcodes might be an array of strings or a single string
    if (typeof emoji.shortcodes === 'string') {
      if (!shortcodes.includes(emoji.shortcodes)) {
        shortcodes.push(emoji.shortcodes.replace(/^:|:$/g, ''));
      }
    } else if (Array.isArray(emoji.shortcodes)) {
      emoji.shortcodes.forEach((code) => {
        const normalizedCode = code.replace(/^:|:$/g, '');
        if (!shortcodes.includes(normalizedCode)) {
          shortcodes.push(normalizedCode);
        }
      });
    }
  }

  return shortcodes;
};

export default {
  getAllShortCodes,
};
