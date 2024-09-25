import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Button from '/imports/ui/components/common/button/component';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import Styled from './styles';

const intlMessages = defineMessages({
  activityCheckTitle: {
    id: 'app.user.activityCheck',
    description: 'Title for activity check modal',
  },
  activityCheckLabel: {
    id: 'app.user.activityCheck.label',
    description: 'Label for activity check modal',
  },
  activityCheckButton: {
    id: 'app.user.activityCheck.check',
    description: 'Check button for activity modal',
  },
});

interface ActivityCheckProps {
  userActivitySign: () => void;
  responseDelay: number;
}

const playAudioAlert = () => {
  const alert = new Audio(`${window.meetingClientSettings.public.app.cdn
    + window.meetingClientSettings.public.app.basename}/resources/sounds/notify.mp3`);
  alert.addEventListener('ended', () => { alert.src = ''; });
  alert.play();
};

const ActivityCheck: React.FC<ActivityCheckProps> = ({ userActivitySign, responseDelay }) => {
  const [responseDelayState, setResponseDelayState] = useState(responseDelay);
  const intl = useIntl();
  const interval = useRef<ReturnType<typeof setTimeout>>();

  const updateRemainingTime = useCallback(() => (

    setInterval(() => {
      if (responseDelayState === 0) return;

      const remainingTime = responseDelayState - 1;

      setResponseDelayState(remainingTime);
    }, 1000)
  ), [responseDelayState]);

  useEffect(() => {
    playAudioAlert();
    interval.current = updateRemainingTime();

    return () => {
      clearInterval(interval.current);
    };
  }, []);

  useEffect(() => {
    clearInterval(interval.current);
    interval.current = updateRemainingTime();
  });

  return (
    <ModalSimple
      hideBorder
      onRequestClose={() => userActivitySign()}
      shouldCloseOnOverlayClick={false}
      shouldShowCloseButton={false}
      priority="high"
      isOpen
    >
      <Styled.ActivityModalContent>
        <h1>{intl.formatMessage(intlMessages.activityCheckTitle)}</h1>
        <p>{intl.formatMessage(intlMessages.activityCheckLabel, { 0: responseDelay })}</p>
        <Button
          color="primary"
          disabled={responseDelay <= 0}
          label={intl.formatMessage(intlMessages.activityCheckButton)}
          onClick={() => userActivitySign()}
          role="button"
          size="lg"
        />
      </Styled.ActivityModalContent>
    </ModalSimple>
  );
};

export default ActivityCheck;
