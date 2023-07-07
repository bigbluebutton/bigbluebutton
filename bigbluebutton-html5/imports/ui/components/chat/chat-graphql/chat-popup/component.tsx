import React, { useEffect } from 'react';
import { PopupContainer, PopupContents } from './styles';
import { GET_WELCOME_MESSAGE, WelcomeMsgsResponse } from './queries';
import { useQuery } from '@apollo/client';
import PopupContent from './popup-content/component';
import Events from '/imports/ui/core/events/events';
import { layoutSelect } from '../../../layout/context';
import { Layout } from '../../../layout/layoutTypes';

interface ChatPopupProps {
  welcomeMessage?: string | null;
  welcomeMsgForModerators?: string | null;
}

const WELCOME_MSG_KEY = 'welcomeMsg';
const WELCOME_MSG_FOR_MODERATORS_KEY = 'welcomeMsgForModerators';
const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_KEY = CHAT_CONFIG.public_id;
const PUBLIC_GROUP_CHAT_KEY = CHAT_CONFIG.public_group_id;


const setWelcomeMsgsOnSession = (key: string, value: boolean) => {
  sessionStorage.setItem(key, String(value));
};

const isBoolean = (v: any): boolean => {
  if (v === 'true') {
    return true;
  } else if (v === 'false') {
    return false;
  }
  // if v is not difined it shouldn't be considered on comparation, so it returns true
  return true;
}

const ChatPopup: React.FC<ChatPopupProps> = ({
  welcomeMessage,
  welcomeMsgForModerators,
}) => {

  const [showWelcomeMessage, setShowWelcomeMessage] = React.useState(
    welcomeMessage && isBoolean(sessionStorage.getItem(WELCOME_MSG_KEY))
  );
  const [showWelcomeMessageForModerators, setShowWelcomeMessageForModerators] = React.useState(
    welcomeMsgForModerators && isBoolean(sessionStorage.getItem(WELCOME_MSG_FOR_MODERATORS_KEY))
  );
  useEffect(() => {
    const eventCallback = () => {
      if (welcomeMessage) {
        setShowWelcomeMessage(true);
        setWelcomeMsgsOnSession(WELCOME_MSG_KEY, true);
      }
      if (welcomeMsgForModerators) {
        setShowWelcomeMessageForModerators(true);
        setWelcomeMsgsOnSession(WELCOME_MSG_FOR_MODERATORS_KEY, true);
      }
    };
    window.addEventListener(Events.RESTORE_WELCOME_MESSAGES, eventCallback);

    return () => {
      removeEventListener(Events.RESTORE_WELCOME_MESSAGES, eventCallback);
    }
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
              setWelcomeMsgsOnSession(WELCOME_MSG_KEY, false);
            }}
          />
        )}
        {showWelcomeMessageForModerators && welcomeMsgForModerators && (
          <PopupContent
            message={welcomeMsgForModerators}
            closePopup={() => {
              setShowWelcomeMessageForModerators(false);
              setWelcomeMsgsOnSession(WELCOME_MSG_FOR_MODERATORS_KEY, false);
            }}
          />
        )}
      </PopupContents>

    </PopupContainer>
  );
};

const ChatPopupContainer: React.FC = () => {
  const {
    data: welcomeData,
    loading: welcomeLoading,
    error: welcomeError,
  } = useQuery<WelcomeMsgsResponse>(GET_WELCOME_MESSAGE);
  const idChatOpen = layoutSelect((i: Layout) => i.idChatOpen);
  if (idChatOpen !== PUBLIC_GROUP_CHAT_KEY) return null;

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