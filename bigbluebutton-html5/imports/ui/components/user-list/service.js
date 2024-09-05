import React from 'react';
import Auth from '/imports/ui/services/auth';
import Storage from '/imports/ui/services/storage/session';
import KEY_CODES from '/imports/utils/keyCodes';
import AudioService from '/imports/ui/components/audio/service';
import logger from '/imports/startup/client/logger';
import Session from '/imports/ui/services/storage/in-memory';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import { notify } from '/imports/ui/services/notification';
import { FormattedMessage } from 'react-intl';
import { getDateString } from '/imports/utils/string-utils';
import { isEmpty } from 'radash';

const DIAL_IN_CLIENT_TYPE = 'dial-in-user';

// session for closed chat list
const CLOSED_CHAT_LIST_KEY = 'closedChatList';
// session for chats the current user started
const STARTED_CHAT_LIST_KEY = 'startedChatList';

const CUSTOM_LOGO_URL_KEY = 'CustomLogoUrl';

const CUSTOM_DARK_LOGO_URL_KEY = 'CustomDarkLogoUrl';

export const setCustomLogoUrl = (path) => Storage.setItem(CUSTOM_LOGO_URL_KEY, path);

export const setCustomDarkLogoUrl = (path) => Storage.setItem(CUSTOM_DARK_LOGO_URL_KEY, path);

export const setModeratorOnlyMessage = (msg) => Storage.setItem('ModeratorOnlyMessage', msg);

const getCustomLogoUrl = () => Storage.getItem(CUSTOM_LOGO_URL_KEY);

const getCustomDarkLogoUrl = () => Storage.getItem(CUSTOM_DARK_LOGO_URL_KEY);

const sortByWhiteboardAccess = (a, b) => {
  const _a = a.whiteboardAccess;
  const _b = b.whiteboardAccess;
  if (!_b && _a) return -1;
  if (!_a && _b) return 1;
  return 0;
};

const sortUsersByUserId = (a, b) => {
  if (a.userId > b.userId) {
    return -1;
  } if (a.userId < b.userId) {
    return 1;
  }

  return 0;
};

const sortUsersByName = (a, b) => {
  const aName = a.sortName || a.nameSortable || '';
  const bName = b.sortName || b.nameSortable || '';

  // Extending for sorting strings with non-ASCII characters
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#sorting_non-ascii_characters
  return aName.localeCompare(bName);
};

const sortByPropTime = (propName, propTimeName, nullValue, a, b) => {
  const aObjTime = a[propName] && a[propName] !== nullValue && a[propTimeName]
    ? a[propTimeName] : Number.MAX_SAFE_INTEGER;

  const bObjTime = b[propName] && b[propName] !== nullValue && b[propTimeName]
    ? b[propTimeName] : Number.MAX_SAFE_INTEGER;

  if (aObjTime < bObjTime) {
    return -1;
  } if (aObjTime > bObjTime) {
    return 1;
  }
  return 0;
};

const sortUsersByAway = (a, b) => sortByPropTime('away', 'awayTime', false, a, b);
const sortUsersByRaiseHand = (a, b) => sortByPropTime('raiseHand', 'raiseHandTime', false, a, b);
const sortUsersByReaction = (a, b) => sortByPropTime('reaction', 'reactionTime', 'none', a, b);

const sortUsersByModerator = (a, b) => {
  const ROLE_MODERATOR = window.meetingClientSettings.public.user.role_moderator;

  if (a.role === ROLE_MODERATOR && b.role === ROLE_MODERATOR) {
    return 0;
  } if (a.role === ROLE_MODERATOR) {
    return -1;
  } if (b.role === ROLE_MODERATOR) {
    return 1;
  }

  return 0;
};

const sortUsersByPhoneUser = (a, b) => {
  if (!a.clientType === DIAL_IN_CLIENT_TYPE && !b.clientType === DIAL_IN_CLIENT_TYPE) {
    return 0;
  } if (!a.clientType === DIAL_IN_CLIENT_TYPE) {
    return -1;
  } if (!b.clientType === DIAL_IN_CLIENT_TYPE) {
    return 1;
  }

  return 0;
};

// current user's name is always on top
const sortUsersByCurrent = (a, b) => {
  if (a.userId === Auth.userID) {
    return -1;
  } if (b.userId === Auth.userID) {
    return 1;
  }

  return 0;
};

const sortUsers = (a, b) => {
  let sort = sortUsersByCurrent(a, b);
  if (sort === 0) sort = sortUsersByModerator(a, b);
  if (sort === 0) sort = sortUsersByRaiseHand(a, b);
  if (sort === 0) sort = sortUsersByAway(a, b);
  if (sort === 0) sort = sortUsersByReaction(a, b);
  if (sort === 0) sort = sortUsersByPhoneUser(a, b);
  if (sort === 0) sort = sortByWhiteboardAccess(a, b);
  if (sort === 0) sort = sortUsersByName(a, b);
  if (sort === 0) sort = sortUsersByUserId(a, b);

  return sort;
};

const isPublicChat = (chat) => {
  const CHAT_CONFIG = window.meetingClientSettings.public.chat;
  return chat.userId === CHAT_CONFIG.public_id;
};

const getActiveChats = ({ groupChatsMessages, groupChats, users }) => {
  const PUBLIC_GROUP_CHAT_ID = window.meetingClientSettings.public.chat.public_group_id;
  const PUBLIC_CHAT_ID = window.meetingClientSettings.public.chat.public_id;

  if (isEmpty(groupChats) && isEmpty(users)) return [];

  const chatIds = Object.keys(groupChats);
  const lastTimeWindows = chatIds.reduce((acc, chatId) => {
    const chat = groupChatsMessages[chatId];
    const lastTimewindowKey = chat?.lastTimewindow;
    const lastTimeWindow = lastTimewindowKey?.split('-')[1];
    return {
      ...acc,
      chatId: lastTimeWindow,
    };
  }, {});

  chatIds.sort((a, b) => {
    if (a === PUBLIC_GROUP_CHAT_ID) {
      return -1;
    }

    if (lastTimeWindows[a] === lastTimeWindows[b]) {
      return 0;
    }

    return 1;
  });

  const chatInfo = chatIds.map((chatId) => {
    const contextChat = groupChatsMessages[chatId];
    const isPublicChatId = chatId === PUBLIC_GROUP_CHAT_ID;
    let unreadMessagesCount = 0;
    if (contextChat) {
      const unreadTimewindows = contextChat.unreadTimeWindows;
      // eslint-disable-next-line
      for (const unreadTimeWindowId of unreadTimewindows) {
        const timeWindow = (isPublicChatId
          ? contextChat?.preJoinMessages[unreadTimeWindowId]
          || contextChat?.posJoinMessages[unreadTimeWindowId]
          : contextChat?.messageGroups[unreadTimeWindowId]);
        unreadMessagesCount += timeWindow.content.length;
      }
    }

    if (chatId !== PUBLIC_GROUP_CHAT_ID) {
      const groupChatsParticipants = groupChats[chatId].participants;
      const otherParticipant = groupChatsParticipants.filter((user) => user.id !== Auth.userID)[0];
      const user = users[otherParticipant.id];
      const startedChats = Session.getItem(STARTED_CHAT_LIST_KEY) || [];

      const ROLE_MODERATOR = window.meetingClientSettings.public.user.role_moderator;

      return {
        color: user?.color || '#7b1fa2',
        isModerator: user?.role === ROLE_MODERATOR,
        name: user?.name || otherParticipant.name,
        avatar: user?.avatar,
        chatId,
        unreadCounter: unreadMessagesCount,
        userId: user?.userId || otherParticipant.id,
        shouldDisplayInChatList: groupChats[chatId].createdBy === Auth.userID
          || startedChats.includes(chatId)
          || !!contextChat,
      };
    }

    return {
      userId: PUBLIC_CHAT_ID,
      name: 'Public Chat',
      icon: 'group_chat',
      chatId: PUBLIC_CHAT_ID,
      unreadCounter: unreadMessagesCount,
      shouldDisplayInChatList: true,
    };
  });

  const currentClosedChats = Storage.getItem(CLOSED_CHAT_LIST_KEY) || [];
  const removeClosedChats = chatInfo.filter((chat) => {
    return !currentClosedChats.some((closedChat) => closedChat.chatId === chat.chatId)
      && chat.shouldDisplayInChatList;
  });

  const sortByChatIdAndUnread = removeClosedChats.sort((a, b) => {
    if (a.chatId === PUBLIC_GROUP_CHAT_ID) {
      return -1;
    }
    if (b.chatId === PUBLIC_CHAT_ID) {
      return 0;
    }
    if (a.unreadCounter > b.unreadCounter) {
      return -1;
    } else if (b.unreadCounter > a.unreadCounter) {
      return 1;
    } else {
      if (a.name.toLowerCase() < b.name.toLowerCase()) {
        return -1;
      }
      if (a.name.toLowerCase() > b.name.toLowerCase()) {
        return 1;
      }
      return 0;
    }
  });
  return sortByChatIdAndUnread;
};

const isMeetingLocked = (lockSettings, usersPolicies) => {
  let isLocked = false;

  if (lockSettings !== undefined) {
    if (lockSettings.disableCam
      || lockSettings.disableMic
      || lockSettings.disablePrivateChat
      || lockSettings.disablePublicChat
      || lockSettings.disableNotes
      || lockSettings.hideUserList
      || lockSettings.hideViewersCursor
      || lockSettings.hideViewersAnnotation
      || usersPolicies.webcamsOnlyForModerator) {
      isLocked = true;
    }
  }

  return isLocked;
};

const toggleVoice = (userId, voiceToggle) => {
  if (userId === Auth.userID) {
    AudioService.toggleMuteMicrophone(voiceToggle);
  } else {
    voiceToggle(userId);
    logger.info({
      logCode: 'usermenu_option_mute_toggle_audio',
      extraInfo: { logType: 'moderator_action', userId },
    }, 'moderator muted user microphone');
  }
};

const focusFirstDropDownItem = () => {
  const dropdownContent = document.querySelector('div[data-test="dropdownContent"][style="visibility: visible;"]');
  if (!dropdownContent) return;
  const list = dropdownContent.getElementsByTagName('li');
  list[0].focus();
};

const roving = (...args) => {
  const [
    event,
    changeState,
    elementsList,
    element,
  ] = args;

  this.selectedElement = element;
  const numberOfChilds = elementsList.childElementCount;
  const menuOpen = Session.getItem('dropdownOpen') || false;

  if (menuOpen) {
    const menuChildren = document.activeElement.getElementsByTagName('li');

    if ([KEY_CODES.ESCAPE, KEY_CODES.ARROW_LEFT].includes(event.keyCode)) {
      Session.setItem('dropdownOpen', false);
      document.activeElement.click();
    }

    if ([KEY_CODES.ARROW_UP].includes(event.keyCode)) {
      menuChildren[menuChildren.length - 1].focus();
    }

    if ([KEY_CODES.ARROW_DOWN].includes(event.keyCode)) {
      for (let i = 0; i < menuChildren.length; i += 1) {
        if (menuChildren[i].hasAttribute('tabIndex')) {
          menuChildren[i].focus();
          break;
        }
      }
    }

    return;
  }

  if ([KEY_CODES.ESCAPE, KEY_CODES.TAB].includes(event.keyCode)) {
    Session.setItem('dropdownOpen', false);
    changeState(null);
  }

  if (event.keyCode === KEY_CODES.ARROW_DOWN) {
    const firstElement = elementsList.firstChild;
    let elRef = element && numberOfChilds > 1 ? element.nextSibling : firstElement;

    elRef = elRef || firstElement;
    changeState(elRef);
  }

  if (event.keyCode === KEY_CODES.ARROW_UP) {
    const lastElement = elementsList.lastChild;
    let elRef = element ? element.previousSibling : lastElement;
    elRef = elRef || lastElement;
    changeState(elRef);
  }

  if ([KEY_CODES.ARROW_RIGHT, KEY_CODES.SPACE, KEY_CODES.ENTER].includes(event.keyCode)) {
    const tether = document.activeElement.firstChild;
    const dropdownTrigger = tether.firstChild;
    dropdownTrigger?.click();
    focusFirstDropDownItem();
  }
};

const sortUsersByFirstName = (a, b) => {
  const aUser = { sortName: a.firstName ? a.firstName : '' };
  const bUser = { sortName: b.firstName ? b.firstName : '' };

  return sortUsersByName(aUser, bUser);
};

const sortUsersByLastName = (a, b) => {
  const aUser = { sortName: a.lastName ? a.lastName : '' };
  const bUser = { sortName: b.lastName ? b.lastName : '' };

  return sortUsersByName(aUser, bUser);
};

export const getUserNamesLink = (docTitle, fnSortedLabel, lnSortedLabel, users, meetingName) => {
  const mimeType = 'text/plain';
  const userNamesObj = users
    .map((u) => {
      const name = u.name.split(' ');
      return ({
        firstName: name[0],
        middleNames: name.length > 2 ? name.slice(1, name.length - 1) : null,
        lastName: name.length > 1 ? name[name.length - 1] : null,
      });
    });

  const getUsernameString = (user) => {
    const { firstName, middleNames, lastName } = user;
    return `${firstName || ''} ${middleNames && middleNames.length > 0 ? middleNames.join(' ') : ''} ${lastName || ''}`;
  };

  const namesByFirstName = userNamesObj.sort(sortUsersByFirstName)
    .map((u) => getUsernameString(u)).join('\r\n');

  const namesByLastName = userNamesObj.sort(sortUsersByLastName)
    .map((u) => getUsernameString(u)).join('\r\n');

  const namesListsString = `${docTitle}\r\n\r\n${fnSortedLabel}\r\n${namesByFirstName}
    \r\n\r\n${lnSortedLabel}\r\n${namesByLastName}`.replace(/ {2}/g, ' ');

  const link = document.createElement('a');
  link.setAttribute('download', `bbb-${meetingName}[users-list]_${getDateString()}.txt`);
  link.setAttribute(
    'href',
    `data: ${mimeType};charset=utf-16,${encodeURIComponent(namesListsString)}`,
  );
  return link;
};

const UserJoinedMeetingAlert = (obj) => {
  const Settings = getSettingsSingletonInstance();
  const {
    userJoinAudioAlerts,
    userJoinPushAlerts,
  } = Settings.application;

  if (!userJoinAudioAlerts && !userJoinPushAlerts) return;

  if (userJoinAudioAlerts) {
    AudioService.playAlertSound(`${window.meetingClientSettings.public.app.cdn
      + window.meetingClientSettings.public.app.basename}`
      + '/resources/sounds/userJoin.mp3');
  }

  if (userJoinPushAlerts) {
    notify(
      // eslint-disable-next-line react/jsx-filename-extension
      <FormattedMessage
        id={obj.messageId}
        values={obj.messageValues}
        description={obj.messageDescription}
      />,
      obj.notificationType,
      obj.icon,
    );
  }
};

const UserLeftMeetingAlert = (obj) => {
  const Settings = getSettingsSingletonInstance();
  const {
    userLeaveAudioAlerts,
    userLeavePushAlerts,
  } = Settings.application;

  if (!userLeaveAudioAlerts && !userLeavePushAlerts) return;

  if (userLeaveAudioAlerts) {
    AudioService.playAlertSound(`${window.meetingClientSettings.public.app.cdn
      + window.meetingClientSettings.public.app.basename}`
      + '/resources/sounds/notify.mp3');
  }

  if (userLeavePushAlerts) {
    notify(
      <FormattedMessage
        id={obj.messageId}
        values={obj.messageValues}
        description={obj.messageDescription}
      />,
      obj.notificationType,
      obj.icon,
    );
  }
};

export default {
  sortUsersByName,
  sortUsers,
  toggleVoice,
  getActiveChats,
  isMeetingLocked,
  isPublicChat,
  roving,
  getCustomLogoUrl,
  getCustomDarkLogoUrl,
  focusFirstDropDownItem,
  sortUsersByCurrent,
  UserJoinedMeetingAlert,
  UserLeftMeetingAlert,
};
