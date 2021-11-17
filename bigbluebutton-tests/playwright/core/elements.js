// Audio
exports.audioModal = 'div[aria-label="Join audio modal"]';
exports.closeAudioButton = 'button[aria-label="Close Join audio modal"]';

// Chat
exports.chatBox = '#message-input';
exports.sendButton = 'button[data-test="sendMessageButton"]';
exports.chatMessages = 'div[data-test="chatMessages"]';
exports.chatOptions = 'button[data-test="chatOptionsMenu"]';
exports.chatClear = 'li[data-test="chatClear"]';
exports.chatSave = 'li[data-test="chatSave"]';

exports.chatUserMessageText = 'p[data-test="chatUserMessageText"]';
exports.chatClearMessageText = 'p[data-test="chatClearMessageText"]';

// Messages
exports.message = 'Hello World!';

// User
exports.applauseIcon = `${this.userAvatar} > div > i[class="icon-bbb-applause"]`;
exports.awayIcon = `${this.userAvatar} > div > i[class="icon-bbb-time"]`;
exports.setStatus = '[data-test="setstatus"]';
exports.away = '[data-test="away"]';
exports.applaud = '[data-test="applause"]';
exports.userListItem = 'div[data-test="userListItem"]';
exports.firstUser = '[data-test="userListItemCurrent"]';

// Common
exports.options = 'button[aria-label="Options"]';
exports.settings = 'li[data-test="settings"]';
exports.modalConfirmButton = 'button[data-test="modalConfirmButton"]';

// Locales
exports.locales = ['af', 'ar', 'az', 'bg-BG', 'bn', 'ca', 'cs-CZ', 'da', 'de',
  'dv', 'el-GR', 'en', 'eo', 'es', 'es-419', 'es-ES', 'es-MX', 'et', 'eu',
  'fa-IR', 'fi', 'fr', 'gl', 'he', 'hi-IN', 'hr', 'hu-HU', 'hy', 'id', 'it-IT',
  'ja', 'ka', 'km', 'kn', 'ko-KR', 'lo-LA', 'lt-LT', 'lv', 'ml', 'mn-MN',
  'nb-NO', 'nl', 'oc', 'pl-PL', 'pt', 'pt-BR', 'ro-RO', 'ru', 'sk-SK', 'sl',
  'sr', 'sv-SE', 'ta', 'te', 'th', 'tr-TR', 'uk-UA', 'vi-VN', 'zh-CN', 'zh-TW'
];
