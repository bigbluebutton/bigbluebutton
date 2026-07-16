import React, { useState, useRef, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useTimeSync from '/imports/ui/core/local-states/useTimeSync';
import Styled from '../participant-room/styles';

const intlMessages = defineMessages({
  durationOfBreakout: {
    id: 'app.createBreakoutRoom.durationOfBreakout',
    description: 'Duration of Breakout Room label',
  },
});

interface BreakoutCountdownProps {
  breakoutDurationInSeconds: number;
  breakoutStartedAt: number;
}

const BreakoutCountdownComponent: React.FC<BreakoutCountdownProps> = ({
  breakoutDurationInSeconds, breakoutStartedAt,
}) => {
  const intl = useIntl();
  const [timeSync] = useTimeSync();
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    const calcRemaining = () => {
      const now = Date.now() + timeSync;
      const end = breakoutStartedAt + (breakoutDurationInSeconds * 1000);
      return Math.max(0, Math.floor((end - now) / 1000));
    };

    setRemainingTime(calcRemaining());

    timerIntervalRef.current = setInterval(() => {
      setRemainingTime(calcRemaining());
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [breakoutDurationInSeconds, breakoutStartedAt, timeSync]);

  const hours = Math.floor(remainingTime / 3600);
  const minutes = Math.floor((remainingTime % 3600) / 60);
  const seconds = remainingTime % 60;
  const padNum = (n: number) => n.toString().padStart(2, '0');

  return (
    <Styled.TimerSection>
      <Styled.TimerLabel>
        {intl.formatMessage(intlMessages.durationOfBreakout)}
      </Styled.TimerLabel>
      <Styled.TimerDisplay data-test="breakoutRemainingTime">
        {padNum(hours)}
        :
        {padNum(minutes)}
        :
        {padNum(seconds)}
      </Styled.TimerDisplay>
    </Styled.TimerSection>
  );
};

const BreakoutCountdown = React.memo(BreakoutCountdownComponent);
BreakoutCountdown.displayName = 'BreakoutCountdown';

export default BreakoutCountdown;
