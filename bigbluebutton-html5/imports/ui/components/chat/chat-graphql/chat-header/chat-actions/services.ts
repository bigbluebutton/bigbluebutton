import { Message } from '/imports/ui/Types/message';
import { stripTags, unescapeHtml } from '/imports/utils/string-utils';
import { IntlShape, defineMessages } from 'react-intl';
import { ChatMessageType } from '/imports/ui/core/enums/chat';
import PollService from '/imports/ui/components/poll/service';

const intlMessages = defineMessages({
  chatClear: {
    id: 'app.chat.clearPublicChatMessage',
    description: 'message of when clear the public chat',
  },
  pollResult: {
    id: 'app.chat.pollResult',
    description: 'used in place of user name who published poll to chat',
  },
  userAway: {
    id: 'app.chat.away',
    description: 'message when user is away',
  },
  userNotAway: {
    id: 'app.chat.notAway',
    description: 'message when user is no longer away',
  },
  deleteMessage: {
    id: 'app.chat.deleteMessage',
    description: '',
  },
  userIsPresenter: {
    id: 'app.chat.isPresenter',
    description: 'message when user is set presenter',
  },
  userIsPresenterSetBy: {
    id: 'app.chat.isPresenterSetBy',
    description: 'message when user is set presenter by someone else',
  },
});

export const htmlDecode = (input: string) => {
  const replacedBRs = input.replaceAll('<br/>', '\n');
  return unescapeHtml(stripTags(replacedBRs));
};

export const generateExportedMessages = (
  messages: Array<Message>,
  intl: IntlShape,
): string => {
  const text = messages.reduce((acc, message) => {
    const date = new Date(message.createdAt);
    const hour = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    const hourMin = `[${hour}:${min}]`;
    let userName = message.user ? `[${message.user.name} : ${message.user.role}]: ` : '';
    let messageText = '';

    switch (message.messageType) {
      case ChatMessageType.CHAT_CLEAR:
        messageText = intl.formatMessage(intlMessages.chatClear);
        break;
      case ChatMessageType.POLL: {
        userName = `${intl.formatMessage(intlMessages.pollResult)}:\n`;

        const metadata = JSON.parse(message.messageMetadata);
        const pollText = htmlDecode(PollService.getPollResultString(metadata, intl).split('<br/>').join('\n'));
        // remove last \n to avoid empty line
        messageText = pollText.slice(0, -1);
        break;
      }
      case ChatMessageType.USER_IS_PRESENTER_MSG: {
        const { assignedBy } = JSON.parse(message.messageMetadata);

        messageText = (assignedBy)
          ? `${intl.formatMessage(intlMessages.userIsPresenterSetBy, {
            presenterName: message.senderName,
            assignedByName: assignedBy,
          })}`
          : `${intl.formatMessage(intlMessages.userIsPresenter, { presenterName: message.senderName })}`;
        break;
      }
      case ChatMessageType.USER_AWAY_STATUS_MSG: {
        const { away } = JSON.parse(message.messageMetadata);

        messageText = (away)
          ? `${message.senderName} ${intl.formatMessage(intlMessages.userAway)}`
          : `${message.senderName} ${intl.formatMessage(intlMessages.userNotAway)}`;
        break;
      }
      case ChatMessageType.TEXT:
      default:
        messageText = message.message
          ? htmlDecode(message.message)
          : intl.formatMessage(intlMessages.deleteMessage, { userName: message.deletedBy?.name });
        break;
    }
    return `${acc}${hourMin} ${userName}${messageText}\n`;
  }, '');
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
