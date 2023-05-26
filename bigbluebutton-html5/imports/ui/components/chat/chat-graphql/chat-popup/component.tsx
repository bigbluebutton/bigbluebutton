import React, { useEffect } from 'react';
import { PopupContainer } from './styles';
import { GET_WELCOME_MESSAGE, WelcomeMsgsResponse } from './queries';
import { useQuery } from '@apollo/client';
import PopupContent from './popup-content/component';

interface ChatPopupProps {
  welcomeMessage?: string | null;
  welcomeMsgForModerators?: string | null;
}

const ChatPopup: React.FC<ChatPopupProps> = ({
  welcomeMessage,
  welcomeMsgForModerators,
}) => {
  const [showWelcomeMessage, setShowWelcomeMessage] = React.useState(false);
  const [showWelcomeMessageForModerators, setShowWelcomeMessageForModerators] = React.useState(false);
  useEffect(() => {
    if (welcomeMessage) {
      setShowWelcomeMessage(true);
    }
    if (welcomeMsgForModerators) {
      setShowWelcomeMessageForModerators(true);
    }
  }, []);
  if (!showWelcomeMessage && !showWelcomeMessageForModerators) return null;
  return (
    <PopupContainer>
      {showWelcomeMessage && welcomeMessage && (
        <PopupContent
          message={welcomeMessage}
          closePopup={()=> setShowWelcomeMessage(false)}
        />
      )}
      {showWelcomeMessageForModerators && welcomeMsgForModerators && (
        <PopupContent
          message={welcomeMsgForModerators}
          closePopup={()=> setShowWelcomeMessageForModerators(false)}
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
  if(welcomeLoading) return null;
  if(welcomeError) return <div>{JSON.stringify(welcomeError)}</div>;
  if(!welcomeData) return null;

  return (
    <ChatPopup
      welcomeMessage={welcomeData.user_welcomeMsgs[0]?.welcomeMsg}
      welcomeMsgForModerators={welcomeData.user_welcomeMsgs[0]?.welcomeMsgForModerators}
    />
  );
};

export default ChatPopupContainer;