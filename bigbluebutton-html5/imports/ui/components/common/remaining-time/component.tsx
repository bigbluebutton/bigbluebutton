import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import humanizeSeconds from '/imports/utils/humanizeSeconds';
import { Text, Time } from './styles';
import { notify } from '/imports/ui/services/notification';
import useTimeSync from '/imports/ui/core/local-states/useTimeSync';

type intlMsg = {
  id: string;
  description?: string;
};

interface RemainingTimeProps {
  referenceStartedTime: number;
  durationInSeconds: number;
  durationLabel: intlMsg;
  isBreakout: boolean;
  boldText: boolean;
  endingLabel?: intlMsg;
  alertLabel?: intlMsg;
}

let lastAlertTime: number | null = null;

const RemainingTime: React.FC<RemainingTimeProps> = (props) => {
  const {
    referenceStartedTime,
    durationInSeconds,
    durationLabel,
    endingLabel = undefined,
    alertLabel = undefined,
    isBreakout,
    boldText,
  } = props;

  const intl = useIntl();
  const [timeSync] = useTimeSync();
  const timeRemainingInterval = React.useRef<ReturnType<typeof setTimeout>>();
  const [remainingTime, setRemainingTime] = useState<number>(-1);

  useEffect(() => {
    if (!durationInSeconds || durationInSeconds <= 0 || !referenceStartedTime) return undefined;

    const calcRemaining = () => {
      const now = Date.now() + timeSync;
      const end = referenceStartedTime + (durationInSeconds * 1000);
      return Math.floor((end - now) / 1000);
    };

    setRemainingTime(calcRemaining());

    clearInterval(timeRemainingInterval.current);
    timeRemainingInterval.current = setInterval(() => {
      setRemainingTime(calcRemaining());
    }, 1000);

    return () => {
      clearInterval(timeRemainingInterval.current);
    };
  }, [durationInSeconds, referenceStartedTime, timeSync]);

  const meetingTimeMessage = React.useRef<string>('');

  if (remainingTime >= 0 && timeRemainingInterval) {
    if (remainingTime > 0) {
      const APP_SETTINGS = window.meetingClientSettings.public.app;
      const REMAINING_TIME_ALERT_THRESHOLD_ARRAY: number[] = APP_SETTINGS.remainingTimeAlertThresholdArray;

      const alertsInSeconds = REMAINING_TIME_ALERT_THRESHOLD_ARRAY.map((item) => item * 60);

      if (alertsInSeconds.includes(remainingTime) && remainingTime !== lastAlertTime && alertLabel) {
        const timeInMinutes = remainingTime / 60;
        const msg = { id: `${alertLabel.id}${timeInMinutes === 1 ? 'Singular' : 'Plural'}` };
        const alertMessage = intl.formatMessage(msg, { timeInMinutes });

        lastAlertTime = remainingTime;
        notify(alertMessage, 'info', 'rooms');
      }

      meetingTimeMessage.current = intl.formatMessage(durationLabel, { remainingTime: humanizeSeconds(remainingTime) });
      if (isBreakout) {
        return (
          <span data-test="timeRemaining">
            {meetingTimeMessage.current}
          </span>
        );
      }
    } else {
      clearInterval(timeRemainingInterval.current);
      if (endingLabel) meetingTimeMessage.current = intl.formatMessage(endingLabel);
    }
  }

  if (boldText) {
    const words = meetingTimeMessage.current.split(' ');
    const time = words.pop();
    const text = words.join(' ');

    return (
      <span data-test="timeRemaining">
        <Text>{text}</Text>
        <br />
        <Time data-test="breakoutRemainingTime">{time}</Time>
      </span>
    );
  }

  return (
    <span data-test="timeRemaining">
      {meetingTimeMessage.current}
    </span>
  );
};

export default RemainingTime;
