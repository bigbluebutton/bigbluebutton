import React, { useEffect } from 'react';
import { PopupContainer } from './styles';
import { GET_WELCOME_MESSAGE, WelcomeMsgsResponse } from './queries';
import { useQuery } from '@apollo/client';
import PopupContent from './popup-content/component';
import Events from '/imports/ui/core/events/events';

interface ChatPopupProps {
  welcomeMessage?: string | null;
  welcomeMsgForModerators?: string | null;
}

const WELCOME_MSG_KEY = 'welcomeMsg';
const WELCOME_MSG_FOR_MODERATORS_KEY = 'welcomeMsgForModerators';


const setWelcomeMsgsOnSession = (key: string, value: boolean) => {
  sessionStorage.setItem(key, String(value));
};

const isBoolean = (v: any): v is boolean => {
  return v === 'true' || v === 'false';
}



const ChatPopup: React.FC<ChatPopupProps> = ({
  welcomeMessage,
  welcomeMsgForModerators,
}) => {

  const [showWelcomeMessage, setShowWelcomeMessage] = React.useState(false);
  const [showWelcomeMessageForModerators, setShowWelcomeMessageForModerators] = React.useState(false);
  useEffect(() => {
    if (welcomeMessage && !isBoolean(sessionStorage.getItem(WELCOME_MSG_KEY))) {
      setShowWelcomeMessage(true);
      setWelcomeMsgsOnSession(WELCOME_MSG_KEY, true);
    }
    if (welcomeMsgForModerators && !isBoolean(sessionStorage.getItem(WELCOME_MSG_FOR_MODERATORS_KEY))) {
      setShowWelcomeMessageForModerators(true);
      setWelcomeMsgsOnSession(WELCOME_MSG_FOR_MODERATORS_KEY, true);
    }

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
  }, []);
  if (!showWelcomeMessage && !showWelcomeMessageForModerators) return null;
  return (
    <PopupContainer>
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
    </PopupContainer>
  );
};

const ChatPopupContainer: React.FC = () => {
  const {
    data: welcomeData,
    loading: welcomeLoading,
    error: welcomeError,
  } = useQuery<WelcomeMsgsResponse>(GET_WELCOME_MESSAGE);
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