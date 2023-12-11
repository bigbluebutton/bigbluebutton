/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect } from 'react';
import { PopupContainer, PopupContents } from './styles';
import { GET_WELCOME_MESSAGE, WelcomeMsgsResponse } from './queries';
import { useQuery } from '@apollo/client';
import PopupContent from './popup-content/component';
import { layoutSelect } from '../../../layout/context';
import { Layout } from '../../../layout/layoutTypes';
import { ChatCommands } from '/imports/ui/core/enums/chat';
import useMeetingSettings from '/imports/ui/core/local-states/useMeetingSettings';

interface ChatPopupProps {
  welcomeMessage: string | null;
  welcomeMsgForModerators: string | null;
}

const welcomeMsgKey = 'welcomeMsg';
const welcomeMsgForModeratorsKey = 'welcomeMsgForModerators';

const setWelcomeMsgsOnSession = (key: string, value: boolean) => {
  sessionStorage.setItem(key, String(value));
};

const isBoolean = (v: unknown): boolean => {
  if (v === 'true') {
    return true;
  } if (v === 'false') {
    return false;
  }
  // if v is not difined it shouldn't be considered on comparation, so it returns true
  return true;
};

const ChatPopup: React.FC<ChatPopupProps> = ({
  welcomeMessage,
  welcomeMsgForModerators,
}) => {
  const [showWelcomeMessage, setShowWelcomeMessage] = React.useState(
    welcomeMessage && isBoolean(sessionStorage.getItem(welcomeMsgKey)),
  );
  const [showWelcomeMessageForModerators, setShowWelcomeMessageForModerators] = React.useState(
    welcomeMsgForModerators && isBoolean(sessionStorage.getItem(welcomeMsgForModeratorsKey)),
  );
  useEffect(() => {
    const eventCallback = () => {
      if (welcomeMessage) {
        setShowWelcomeMessage(true);
        setWelcomeMsgsOnSession(welcomeMsgKey, true);
      }
      if (welcomeMsgForModerators) {
        setShowWelcomeMessageForModerators(true);
        setWelcomeMsgsOnSession(welcomeMsgForModeratorsKey, true);
      }
    };
    window.addEventListener(ChatCommands.RESTORE_WELCOME_MESSAGES, eventCallback);

    return () => {
      // eslint-disable-next-line no-restricted-globals
      removeEventListener(ChatCommands.RESTORE_WELCOME_MESSAGES, eventCallback);
    };
  }, []);
  if (!showWelcomeMessage && !showWelcomeMessageForModerators) return null;
  return (
    <PopupContainer>
      <PopupContents>
        {showWelcomeMessage && welcomeMessage && (
          <PopupContent
            message={welcomeMessage}
            closePopup={() => {
              setShowWelcomeMessage(false);
              setWelcomeMsgsOnSession(welcomeMsgKey, false);
            }}
          />
        )}
        {showWelcomeMessageForModerators && welcomeMsgForModerators && (
          <PopupContent
            message={welcomeMsgForModerators}
            closePopup={() => {
              setShowWelcomeMessageForModerators(false);
              setWelcomeMsgsOnSession(welcomeMsgForModeratorsKey, false);
            }}
          />
        )}
      </PopupContents>

    </PopupContainer>
  );
};

const ChatPopupContainer: React.FC = () => {
  const [MeetingSettings] = useMeetingSettings();
  const chatConfig = MeetingSettings.public.chat;
  const publicGroupChatKey = chatConfig.public_group_id;

  const {
    data: welcomeData,
    loading: welcomeLoading,
    error: welcomeError,
  } = useQuery<WelcomeMsgsResponse>(GET_WELCOME_MESSAGE);
  const idChatOpen = layoutSelect((i: Layout) => i.idChatOpen);
  if (idChatOpen !== publicGroupChatKey) return null;

  if (welcomeLoading) return null;
  if (welcomeError) return <div>{JSON.stringify(welcomeError)}</div>;
  if (!welcomeData) return null;

  return (
    <ChatPopup
      welcomeMessage={welcomeData.user_welcomeMsgs[0]?.welcomeMsg}
      welcomeMsgForModerators={welcomeData.user_welcomeMsgs[0]?.welcomeMsgForModerators}
    />
  );
};

export default ChatPopupContainer;
