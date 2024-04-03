/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import BBBMenu from '/imports/ui/components/common/menu/component';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import { useLazyQuery, useMutation } from '@apollo/client';
import { uid } from 'radash';
import { isEmpty } from 'ramda';
import {
  GET_CHAT_MESSAGE_HISTORY, GET_PERMISSIONS, getChatMessageHistory, getPermissions,
} from './queries';
import Trigger from '/imports/ui/components/common/control-header/right/component';
import { generateExportedMessages } from './services';
import { getDateString } from '/imports/utils/string-utils';
import { ChatCommands } from '/imports/ui/core/enums/chat';
import { CHAT_PUBLIC_CLEAR_HISTORY } from './mutations';
import useMeetingSettings from '/imports/ui/core/local-states/useMeetingSettings';

// @ts-ignore - temporary, while meteor exists in the project
// const CHAT_CONFIG = window.meetingClientSettings.public.chat;
// const ENABLE_SAVE_AND_COPY_PUBLIC_CHAT = CHAT_CONFIG.enableSaveAndCopyPublicChat;

const intlMessages = defineMessages({
  clear: {
    id: 'app.chat.dropdown.clear',
    description: 'Clear button label',
  },
  save: {
    id: 'app.chat.dropdown.save',
    description: 'Clear button label',
  },
  copy: {
    id: 'app.chat.dropdown.copy',
    description: 'Copy button label',
  },
  copySuccess: {
    id: 'app.chat.copySuccess',
    description: 'aria success alert',
  },
  copyErr: {
    id: 'app.chat.copyErr',
    description: 'aria error alert',
  },
  options: {
    id: 'app.chat.dropdown.options',
    description: 'Chat Options',
  },
  showWelcomeMessage: {
    id: 'app.chat.dropdown.showWelcomeMessage',
    description: 'Restore button label',
  },
});

const ChatActions: React.FC = () => {
  const [MeetingSettings] = useMeetingSettings();
  const chatConfig = MeetingSettings.public.chat;
  const { enableSaveAndCopyPublicChat } = chatConfig;
  const intl = useIntl();
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  const uniqueIdsRef = useRef<string[]>([uid(1), uid(2), uid(3), uid(4)]);
  const downloadOrCopyRef = useRef<'download' | 'copy' | null>(null);
  const [userIsModerator, setUserIsmoderator] = useState<boolean>(false);
  const [meetingIsBreakout, setMeetingIsBreakout] = useState<boolean>(false);
  const [showShowWelcomeMessages, setShowShowWelcomeMessages] = useState<boolean>(false);
  const [chatPublicClearHistory] = useMutation(CHAT_PUBLIC_CLEAR_HISTORY);
  const [
    getChatMessageHistory,
    {
      error: errorHistory,
      data: dataHistory,
    }] = useLazyQuery<getChatMessageHistory>(GET_CHAT_MESSAGE_HISTORY, { fetchPolicy: 'no-cache' });

  const [
    getPermissions,
    {
      error: errorPermissions,
      data: dataPermissions,
    }] = useLazyQuery<getPermissions>(GET_PERMISSIONS, { fetchPolicy: 'cache-and-network' });

  useEffect(() => {
    if (dataHistory) {
      const exportedString = generateExportedMessages(
        dataHistory.chat_message_public,
        dataHistory.user_welcomeMsgs[0],
        intl,
      );
      if (downloadOrCopyRef.current === 'download') {
        const link = document.createElement('a');
        const mimeType = 'text/plain';
        link.setAttribute('download', `bbb-${dataHistory.meeting[0].name}[public-chat]_${getDateString()}.txt`);
        link.setAttribute(
          'href',
          `data: ${mimeType};charset=utf-8,`
          + `${encodeURIComponent(exportedString)}`,
        );
        link.dispatchEvent(new MouseEvent('click', { bubbles: false, cancelable: true, view: window }));
        downloadOrCopyRef.current = null;
      } else if (downloadOrCopyRef.current === 'copy') {
        navigator.clipboard.writeText(exportedString);
        downloadOrCopyRef.current = null;
      }
    }
  }, [dataHistory]);

  useEffect(() => {
    if (dataPermissions) {
      setUserIsmoderator(dataPermissions.user_current[0].isModerator);
      setMeetingIsBreakout(dataPermissions.meeting[0].isBreakout);
      if (!isEmpty(dataPermissions.user_welcomeMsgs[0].welcomeMsg || '')
        || !isEmpty(dataPermissions.user_welcomeMsgs[0].welcomeMsgForModerators || '')) {
        setShowShowWelcomeMessages(true);
      }
    }
  }, [dataPermissions]);

  const actions = useMemo(() => {
    const dropdownActions = [
      {
        key: uniqueIdsRef.current[0],
        enable: enableSaveAndCopyPublicChat,
        icon: 'download',
        dataTest: 'chatSave',
        label: intl.formatMessage(intlMessages.save),
        onClick: () => {
          getChatMessageHistory();
          downloadOrCopyRef.current = 'download';
        },
      },
      {
        key: uniqueIdsRef.current[1],
        enable: enableSaveAndCopyPublicChat,
        icon: 'copy',
        id: 'clipboardButton',
        dataTest: 'chatCopy',
        label: intl.formatMessage(intlMessages.copy),
        onClick: () => {
          getChatMessageHistory();
          downloadOrCopyRef.current = 'copy';
        },
      },
      {
        key: uniqueIdsRef.current[2],
        enable: userIsModerator && !meetingIsBreakout,
        icon: 'delete',
        dataTest: 'chatClear',
        label: intl.formatMessage(intlMessages.clear),
        onClick: () => chatPublicClearHistory(),
      },
      {
        key: uniqueIdsRef.current[3],
        enable: showShowWelcomeMessages,
        icon: 'about',
        dataTest: 'restoreWelcomeMessages',
        label: intl.formatMessage(intlMessages.showWelcomeMessage),
        onClick: () => {
          const restoreWelcomeMessagesEvent = new CustomEvent(ChatCommands.RESTORE_WELCOME_MESSAGES);
          window.dispatchEvent(restoreWelcomeMessagesEvent);
        },
      },
    ];
    return dropdownActions.filter((action) => action.enable);
  }, [userIsModerator, meetingIsBreakout, showShowWelcomeMessages]);
  if (errorHistory) {
    return (
      <p>
        Error loading chat history:
        {JSON.stringify(errorHistory)}
      </p>
    );
  }
  if (errorPermissions) {
    return (
      <p>
        Error loading permissions:
        {' '}
        {JSON.stringify(errorPermissions)}
      </p>
    );
  }
  return (
    <BBBMenu
      trigger={(
        <Trigger
          label={intl.formatMessage(intlMessages.options)}
          aria-label={intl.formatMessage(intlMessages.options)}
          hideLabel
          icon="more"
          onClick={() => {
            getPermissions();
          }}
          data-test="chatOptionsMenu"
        />
      )}
      opts={{
        id: 'chat-options-dropdown-menu',
        keepMounted: true,
        transitionDuration: 0,
        elevation: 3,
        getcontentanchorel: null,
        fullwidth: 'true',
        anchorOrigin: { vertical: 'bottom', horizontal: isRTL ? 'right' : 'left' },
        transformOrigin: { vertical: 'top', horizontal: isRTL ? 'right' : 'left' },
      }}
      actions={actions}
    />
  );
};

export default ChatActions;
