import { Message } from "/imports/ui/Types/message";
import { makeCall } from "/imports/ui/services/api";
import { stripTags, unescapeHtml } from '/imports/utils/string-utils';
import { IntlShape, defineMessages } from 'react-intl';
import { ChatMessageType } from '/imports/ui/core/enums/chat';

const intlMessages = defineMessages({
  chatClear: {
    id: 'app.chat.clearPublicChatMessage',
    description: 'message of when clear the public chat',
  },
});

export const htmlDecode = (input: string) => {
  const replacedBRs = input.replaceAll('<br/>', '\n');
  return unescapeHtml(stripTags(replacedBRs));
};

export const generateExportedMessages = (
  messages: Array<Message>,
  welcomeSettings: { welcomeMsg: string, welcomeMsgForModerators: string | null },
  intl: IntlShape,
): string => {
  const welcomeMessage = htmlDecode(welcomeSettings.welcomeMsg);
  const modOnlyMessage = welcomeSettings.welcomeMsgForModerators && htmlDecode(welcomeSettings.welcomeMsgForModerators);
  const systemMessages = `${welcomeMessage ? `system: ${welcomeMessage}` : ''}\n ${modOnlyMessage ? `system: ${modOnlyMessage}` : ''}\n`

  const text = messages.reduce((acc, message) => {
    const date = new Date(message.createdTime);
    const hour = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    const hourMin = `[${hour}:${min}]`;
    const userName = message.user ? `[${message.user.name} : ${message.user.role}]: ` : '';
    let messageText = '';

    switch (message.messageType) {
      case ChatMessageType.CHAT_CLEAR:
        messageText = intl.formatMessage(intlMessages.chatClear);
        break;
      case ChatMessageType.TEXT:
      default:
        messageText = htmlDecode(message.message);
        break;
    }
    return `${acc}${hourMin} ${userName}${messageText}\n`;
  }, welcomeMessage ? systemMessages : '');
  return text;
};

export const getDateString = (date = new Date()) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const dayOfMonth = date.getDate().toString().padStart(2, '0');
  const time = `${hours}-${minutes}`;
  const dateString = `${date.getFullYear()}-${month}-${dayOfMonth}_${time}`;
  return dateString;
};

// TODO: Make action using mutations
export const clearPublicChatHistory = () => (makeCall('clearPublicChatHistory'));
