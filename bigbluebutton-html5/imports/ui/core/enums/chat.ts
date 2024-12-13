export const enum ChatEvents {
  SENT_MESSAGE = 'sentMessage',
  CHAT_FOCUS_MESSAGE_REQUEST = 'ChatFocusMessageRequest',
  CHAT_KEYBOARD_FOCUS_MESSAGE_REQUEST = 'ChatKeyboardFocusMessageRequest',
  CHAT_KEYBOARD_FOCUS_MESSAGE_CANCEL = 'ChatKeyboardFocusMessageCancel',
  CHAT_REPLY_INTENTION = 'ChatReplyIntention',
  CHAT_CANCEL_REPLY_INTENTION = 'ChatCancelReplyIntention',
  CHAT_EDIT_REQUEST = 'ChatEditRequest',
  CHAT_CANCEL_EDIT_REQUEST = 'ChatCancelEditRequest',
  CHAT_DELETE_REQUEST = 'ChatDeleteRequest',
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
  USER_IS_PRESENTER_MSG = 'userIsPresenterMsg',
  PLUGIN = 'plugin'
}
