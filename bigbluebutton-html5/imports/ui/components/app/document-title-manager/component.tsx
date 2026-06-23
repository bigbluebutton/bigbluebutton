import React, {
  useContext, useEffect, useMemo, useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { GenericContentType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/generic-content-item/enums';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { layoutSelect, layoutSelectInput } from '/imports/ui/components/layout/context';
import { PANELS } from '/imports/ui/components/layout/enums';
import { Layout, Input } from '/imports/ui/components/layout/layoutTypes';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useChat from '/imports/ui/core/hooks/useChat';
import { Chat } from '/imports/ui/Types/chat';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import { useStorageKey } from '/imports/ui/services/storage/hooks';
import {
  DOCUMENT_TITLE_VIEW_CHANGED,
  getActiveDocumentTitleView,
} from './service';

const intlMessages = defineMessages({
  defaultViewLabel: {
    id: 'app.title.defaultViewLabel',
    description: 'view name appended to document title',
  },
  userListLabel: {
    id: 'app.userList.label',
    description: 'view name appended to document title',
  },
  chatLabel: {
    id: 'app.chat.label',
    description: 'view name appended to document title',
  },
  publicChatTitle: {
    id: 'app.chat.titlePublic',
    description: 'view name appended to document title',
  },
  privateChatTitle: {
    id: 'app.chat.titlePrivate',
    description: 'view name appended to document title',
  },
  pollTitle: {
    id: 'app.poll.pollPaneTitle',
    description: 'view name appended to document title',
  },
  captionsTitle: {
    id: 'app.userList.captionsTitle',
    description: 'view name appended to document title',
  },
  notesTitle: {
    id: 'app.notes.title',
    description: 'view name appended to document title',
  },
  breakoutRoomsTitle: {
    id: 'app.createBreakoutRoom.title',
    description: 'view name appended to document title',
  },
  timerTitle: {
    id: 'app.timer.title',
    description: 'view name appended to document title',
  },
  waitingUsersTitle: {
    id: 'app.userList.guest.waitingUsers',
    description: 'view name appended to document title',
  },
  uploadPresentationTitle: {
    id: 'app.presentationUploder.uploadViewTitle',
    description: 'view name appended to document title',
  },
  defaultBreakoutName: {
    id: 'app.createBreakoutRoom.room',
    description: 'default breakout room name',
  },
});

const getClientTitle = () => {
  const publicConfig = window.meetingClientSettings?.public;
  return getFromUserSettings('bbb_client_title', publicConfig?.app?.clientTitle || 'BigBlueButton');
};

const getChatTitle = (
  chatId: string,
  chats: Array<Partial<Chat>> | null | undefined,
  intl: ReturnType<typeof useIntl>,
) => {
  const chatConfig = window.meetingClientSettings.public.chat;
  const isPublicChatId = chatId === chatConfig.public_id || chatId === chatConfig.public_group_id;
  const selectedChat = chats?.find((chat) => (
    chat.chatId === chatId
    || (isPublicChatId && (chat.chatId === chatConfig.public_id || chat.chatId === chatConfig.public_group_id))
  ));

  if (selectedChat?.public || isPublicChatId) {
    return intl.formatMessage(intlMessages.publicChatTitle);
  }

  if (selectedChat?.participant?.name) {
    return intl.formatMessage(intlMessages.privateChatTitle, {
      participantName: selectedChat.participant.name,
    });
  }

  return intl.formatMessage(intlMessages.chatLabel);
};

const DocumentTitleManager: React.FC = () => {
  const intl = useIntl();
  const idChatOpen = layoutSelect((i: Layout) => i.idChatOpen);
  const sidebarNavigation = layoutSelectInput((i: Input) => i.sidebarNavigation);
  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);
  const uploadPresentationOpen = !!useStorageKey('showUploadPresentationView');
  const [registeredViewTitle, setRegisteredViewTitle] = useState<string | null>(getActiveDocumentTitleView());
  const { pluginsExtensibleAreasAggregatedState } = useContext(PluginsContext);
  const { data: meeting } = useMeeting((m) => ({
    name: m.name,
    breakoutPolicies: {
      sequence: m.breakoutPolicies?.sequence,
    },
  }));
  const { data: chats } = useChat((chat) => ({
    chatId: chat.chatId,
    participant: chat.participant,
    public: chat.public,
  })) as GraphqlDataHookSubscriptionResponse<Partial<Chat>[]>;

  const genericSidekickContentTitle = useMemo(() => {
    const { sidebarContentPanel } = sidebarContent;
    if (!sidebarContentPanel.startsWith(PANELS.GENERIC_CONTENT_SIDEKICK)) return null;

    const genericSidekickContentId = sidebarContentPanel.replace(PANELS.GENERIC_CONTENT_SIDEKICK, '');
    const genericContentItems = pluginsExtensibleAreasAggregatedState.genericContentItems || [];
    const genericSidekickContentItems = genericContentItems
      .filter((item) => item.type === GenericContentType.SIDEKICK_AREA) as PluginSdk.GenericContentSidekickArea[];
    const genericContentItem = genericSidekickContentItems.find((item) => item.id === genericSidekickContentId);

    return genericContentItem?.name || null;
  }, [pluginsExtensibleAreasAggregatedState.genericContentItems, sidebarContent]);

  const activeViewTitle = useMemo(() => {
    if (registeredViewTitle) return registeredViewTitle;
    if (uploadPresentationOpen) return intl.formatMessage(intlMessages.uploadPresentationTitle);

    switch (sidebarContent.sidebarContentPanel) {
      case PANELS.CHAT:
        return getChatTitle(idChatOpen, chats, intl);
      case PANELS.POLL:
        return intl.formatMessage(intlMessages.pollTitle);
      case PANELS.CAPTIONS:
        return intl.formatMessage(intlMessages.captionsTitle);
      case PANELS.BREAKOUT:
        return intl.formatMessage(intlMessages.breakoutRoomsTitle);
      case PANELS.SHARED_NOTES:
        return intl.formatMessage(intlMessages.notesTitle);
      case PANELS.TIMER:
        return intl.formatMessage(intlMessages.timerTitle);
      case PANELS.WAITING_USERS:
        return intl.formatMessage(intlMessages.waitingUsersTitle);
      default:
        if (genericSidekickContentTitle) return genericSidekickContentTitle;
    }

    if (sidebarNavigation.isOpen && sidebarNavigation.sidebarNavPanel === PANELS.USERLIST) {
      return intl.formatMessage(intlMessages.userListLabel);
    }

    return intl.formatMessage(intlMessages.defaultViewLabel);
  }, [
    chats,
    genericSidekickContentTitle,
    idChatOpen,
    intl,
    sidebarContent.sidebarContentPanel,
    sidebarNavigation.isOpen,
    sidebarNavigation.sidebarNavPanel,
    registeredViewTitle,
    uploadPresentationOpen,
  ]);

  const documentTitle = useMemo(() => {
    const titleSegments = [getClientTitle()];
    const meetingName = meeting?.name?.trim();
    const breakoutNum = meeting?.breakoutPolicies?.sequence;

    if (meetingName) {
      if (breakoutNum && breakoutNum > 0) {
        const defaultBreakoutName = intl.formatMessage(intlMessages.defaultBreakoutName, {
          roomNumber: breakoutNum,
        });

        titleSegments.push(meetingName === defaultBreakoutName ? `${breakoutNum}` : meetingName);
      } else {
        titleSegments.push(meetingName);
      }
    }

    if (activeViewTitle) titleSegments.push(activeViewTitle);

    return titleSegments.join(' - ');
  }, [activeViewTitle, intl, meeting]);

  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle]);

  useEffect(() => {
    const handleDocumentTitleViewChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{ activeTitle: string | null }>;
      setRegisteredViewTitle(customEvent.detail.activeTitle);
    };

    window.addEventListener(DOCUMENT_TITLE_VIEW_CHANGED, handleDocumentTitleViewChanged);
    return () => window.removeEventListener(DOCUMENT_TITLE_VIEW_CHANGED, handleDocumentTitleViewChanged);
  }, []);

  return null;
};

export default DocumentTitleManager;
