/* eslint-disable @typescript-eslint/ban-ts-comment */
import { makeCall } from '/imports/ui/services/api';
import { throttle } from '/imports/utils/throttle';

const START_TYPING_THROTTLE_INTERVAL = 1000;

// session for closed chat list

export const startUserTyping = throttle(
  (chatId: string) => {
    makeCall('startUserTyping', chatId);
  },
  START_TYPING_THROTTLE_INTERVAL,
  { leading: true, trailing: false },
);

export const textToMarkdown = (message: string) => {
  let parsedMessage = message || '';
  parsedMessage = parsedMessage.trim();

  // replace url with markdown links
  const urlRegex = /(?<!\]\()https?:\/\/([\w-]+\.)+\w{1,6}([/?=&#.]?[\w-]+)*/gm;
  parsedMessage = parsedMessage.replace(urlRegex, '[$&]($&)');

  // replace new lines with markdown new lines
  parsedMessage = parsedMessage.replace(/\n\r?/g, '  \n');

  return parsedMessage;
};

export default {
  startUserTyping,
  textToMarkdown,
};
