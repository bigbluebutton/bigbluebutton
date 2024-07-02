/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import BBBMenu from '/imports/ui/components/common/menu/component';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { uid } from 'radash';
import { isEmpty } from 'ramda';
import {
  GET_CHAT_MESSAGE_HISTORY, getChatMessageHistory,
} from './queries';
import Trigger from '/imports/ui/components/common/control-header/right/component';
import { generateExportedMessages } from './services';
import { getDateString } from '/imports/utils/string-utils';
import { ChatCommands } from '/imports/ui/core/enums/chat';
import { CHAT_PUBLIC_CLEAR_HISTORY } from './mutations';
import useMeetingSettings from '/imports/ui/core/local-states/useMeetingSettings';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { GET_WELCOME_MESSAGE, WelcomeMsgsResponse } from '/imports/ui/components/chat/chat-graphql/chat-popup/queries';

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
  const { data: currentUserData, loading: currentUserLoading } = useCurrentUser((u) => ({
    isModerator: u.isModerator,
  }));
  const { data: meetingData, loading: meetingLoading } = useMeeting((m) => ({
    isBreakout: m.isBreakout,
    name: m.name,
  }));
  const { data: welcomeData } = useQuery<WelcomeMsgsResponse>(GET_WELCOME_MESSAGE);
  const [
    getChatMessageHistory,
    {
      error: errorHistory,
      data: dataHistory,
    }] = useLazyQuery<getChatMessageHistory>(GET_CHAT_MESSAGE_HISTORY, { fetchPolicy: 'no-cache' });

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
    if (currentUserData) {
      setUserIsmoderator(!!currentUserData.isModerator);
    }
    if (meetingData) {
      setMeetingIsBreakout(!!meetingData.isBreakout);
    }
  }, [currentUserData, meetingData]);

  useEffect(() => {
    if (welcomeData) {
      if (
        !isEmpty(welcomeData.user_welcomeMsgs[0]?.welcomeMsg || '')
        || !isEmpty(welcomeData.user_welcomeMsgs[0]?.welcomeMsgForModerators || '')
      ) {
        setShowShowWelcomeMessages(true);
      }
    }
  }, [welcomeData]);

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
        enable: true,
        disabled: !userIsModerator || meetingIsBreakout,
        icon: 'delete',
        dataTest: 'chatClear',
        label: intl.formatMessage(intlMessages.clear),
        onClick: () => chatPublicClearHistory(),
        loading: currentUserLoading || meetingLoading,
      },
      {
        key: uniqueIdsRef.current[3],
        enable: true,
        disabled: !showShowWelcomeMessages,
        icon: 'about',
        dataTest: 'restoreWelcomeMessages',
        label: intl.formatMessage(intlMessages.showWelcomeMessage),
        onClick: () => {
          const restoreWelcomeMessagesEvent = new CustomEvent(ChatCommands.RESTORE_WELCOME_MESSAGES);
          window.dispatchEvent(restoreWelcomeMessagesEvent);
        },
        loading: currentUserLoading,
      },
    ];
    return dropdownActions.filter((action) => action.enable);
  }, [userIsModerator, meetingIsBreakout, showShowWelcomeMessages, currentUserLoading, meetingLoading]);
  if (errorHistory) {
    return (
      <p>
        Error loading chat history:
        {JSON.stringify(errorHistory)}
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
          data-test="chatOptionsMenu"
          onClick={() => {}}
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
