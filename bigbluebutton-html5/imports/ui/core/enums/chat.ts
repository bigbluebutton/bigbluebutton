export const enum ChatEvents {
  SENT_MESSAGE = 'sentMessage',
  CHAT_FOCUS_MESSAGE_REQUEST = 'ChatFocusMessageRequest',
  CHAT_REPLY_INTENTION = 'ChatReplyIntention',
}

export const enum ChatCommands {
  RESTORE_WELCOME_MESSAGES = 'restoreWelcomeMessages',
}

export const enum ChatMessageType {
  TEXT = 'default',
  API = 'api',
  POLL = 'poll',
  PRESENTATION = 'presentation',
  CHAT_CLEAR = 'publicChatHistoryCleared',
  BREAKOUT_ROOM = 'breakoutRoomModeratorMsg',
  USER_AWAY_STATUS_MSG = 'userAwayStatusMsg',
  PLUGIN = 'plugin'
}
