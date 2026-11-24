import {
  useCallback, useEffect, useMemo, useRef,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import {
  RAISED_HAND_USERS,
  RaisedHandUsersSubscriptionResponse,
} from '/imports/ui/core/graphql/queries/users';
import {
  CHAT_MESSAGE_STREAM,
  ChatMessageStreamResponse,
} from '/imports/ui/components/chat/chat-graphql/alert/queries';
import { getChatAlertSoundUrl } from '/imports/ui/components/chat/chat-graphql/alert/service';
import { getRaiseHandSoundUrl } from '/imports/ui/components/raisehand-notifier/service';
import useSmartTrigger from '../hooks/useSmartTrigger';
import useWindowAttention from '/imports/ui/hooks/useWindowAttention';
import { getSmartTriggersSettings } from '../service';
import { CooldownPolicy } from '../types';

const intlMessages = defineMessages({
  raisedHand: {
    id: 'app.smartTriggers.presenterAway.raisedHand',
    description: 'Announced to an away presenter when someone raises a hand',
  },
  publicChat: {
    id: 'app.smartTriggers.presenterAway.publicChat',
    description: 'Announced to an away presenter on a new public chat message',
  },
  unmuteRequest: {
    id: 'app.smartTriggers.presenterAway.unmuteRequest',
    description: 'Announced to an away presenter asked to unmute',
  },
});

// An unmute request has no audio alert of its own to borrow the sound from.
const getUnmuteRequestSoundUrl = () => {
  const { cdn, basename } = window.meetingClientSettings.public.app;
  return `${cdn + basename}/resources/sounds/notify.mp3`;
};

interface PresenterAwaySettings {
  presenterAwaySound?: boolean;
  raiseHandAudioAlerts?: boolean;
  chatAudioAlerts?: boolean;
}

const usePresenterAwayRule = () => {
  const intl = useIntl();
  const { cooldownMs } = getSmartTriggersSettings().presenterAway;
  const cooldown = useMemo<CooldownPolicy>(() => ({ kind: 'time', ms: cooldownMs }), [cooldownMs]);
  const { fire } = useSmartTrigger('presenterAway', cooldown);
  const {
    presenterAwaySound = true,
    raiseHandAudioAlerts = false,
    chatAudioAlerts = false,
  } = useSettings(SETTINGS.APPLICATION) as PresenterAwaySettings;
  const { data: currentUser } = useCurrentUser((u) => ({
    userId: u.userId,
    presenter: u.presenter,
    requestedUnmuteByMod: u.requestedUnmuteByMod,
  }));
  const attention = useWindowAttention();

  const userId = currentUser?.userId;
  const away = !!currentUser?.presenter && !attention;
  const awaySince = useMemo(() => new Date().toISOString(), [away]);
  const raisedHandsBaseline = useRef<Set<string> | null>(null);
  const publicChatId = window.meetingClientSettings.public.chat.public_group_id;

  const { data: raisedHandsData } = useDeduplicatedSubscription<RaisedHandUsersSubscriptionResponse>(
    RAISED_HAND_USERS,
    { skip: !away },
  );
  const { data: chatData } = useDeduplicatedSubscription<ChatMessageStreamResponse>(
    CHAT_MESSAGE_STREAM,
    { skip: !away, variables: { createdAt: awaySince } },
  );

  const announce = useCallback((message: string, soundUrl: string, existingSoundEnabled: boolean) => {
    fire({
      presentation: 'announcement',
      message,
      soundUrl: presenterAwaySound && !existingSoundEnabled ? soundUrl : undefined,
    });
  }, [fire, presenterAwaySound]);

  useEffect(() => {
    if (!away || !raisedHandsData) {
      raisedHandsBaseline.current = null;
      return;
    }
    const raisedIds = raisedHandsData.user
      .map((user) => user.userId)
      .filter((raisedId) => raisedId !== userId);
    const baseline = raisedHandsBaseline.current;
    raisedHandsBaseline.current = new Set(raisedIds);
    if (!baseline) return;

    const newlyRaised = raisedHandsData.user.find((user) => (
      user.userId !== userId && !baseline.has(user.userId)
    ));
    if (newlyRaised) {
      announce(
        intl.formatMessage(intlMessages.raisedHand, { name: newlyRaised.name }),
        getRaiseHandSoundUrl(),
        raiseHandAudioAlerts,
      );
    }
  }, [away, raisedHandsData]);

  useEffect(() => {
    if (!away || !chatData) return;
    const message = chatData.chat_message_stream.find((chatMessage) => (
      chatMessage.chatId === publicChatId && chatMessage.senderId && chatMessage.senderId !== userId
    ));
    if (message) {
      announce(
        intl.formatMessage(intlMessages.publicChat, { name: message.senderName ?? '' }),
        getChatAlertSoundUrl(),
        chatAudioAlerts,
      );
    }
  }, [chatData]);

  useEffect(() => {
    if (away && currentUser?.requestedUnmuteByMod) {
      announce(intl.formatMessage(intlMessages.unmuteRequest), getUnmuteRequestSoundUrl(), false);
    }
  }, [currentUser?.requestedUnmuteByMod]);
};

export default usePresenterAwayRule;
