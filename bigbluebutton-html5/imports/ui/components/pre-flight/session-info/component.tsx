import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';

const intlMessages = defineMessages({
  startedJustNow: {
    id: 'app.preFlight.sessionStartedJustNow',
    description: 'Session age, when the session started less than a minute ago',
  },
  startedMinuteAgo: {
    id: 'app.preFlight.sessionStartedMinuteAgo',
    description: 'Session age, when the session started one minute ago',
  },
  startedMinutesAgo: {
    id: 'app.preFlight.sessionStartedMinutesAgo',
    description: 'Session age in minutes, under an hour',
  },
  startedHourAgo: {
    id: 'app.preFlight.sessionStartedHourAgo',
    description: 'Session age, between one and two hours',
  },
  startedHoursAgo: {
    id: 'app.preFlight.sessionStartedHoursAgo',
    description: 'Session age in whole hours, from two hours on',
  },
});

const MINUTE = 60 * 1000;

interface SessionInfoProps {
  meetingName: string;
  // Epoch milliseconds; 0 when unknown, which leaves the age line out.
  createdTime: number;
}

const SessionInfo: React.FC<SessionInfoProps> = ({ meetingName, createdTime }) => {
  const intl = useIntl();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!createdTime) return undefined;
    // The line reads in whole minutes, so a coarse tick keeps it current.
    const tick = setInterval(() => setNow(Date.now()), MINUTE / 2);
    return () => clearInterval(tick);
  }, [createdTime]);

  let age;
  if (createdTime) {
    const minutes = Math.max(0, Math.floor((now - createdTime) / MINUTE));
    const hours = Math.floor(minutes / 60);
    if (minutes < 1) age = intl.formatMessage(intlMessages.startedJustNow);
    else if (minutes === 1) age = intl.formatMessage(intlMessages.startedMinuteAgo);
    else if (hours < 1) age = intl.formatMessage(intlMessages.startedMinutesAgo, { minutes });
    else if (hours === 1) age = intl.formatMessage(intlMessages.startedHourAgo);
    else age = intl.formatMessage(intlMessages.startedHoursAgo, { hours });
  }

  return (
    <Styled.SessionInfo data-test="preFlightSessionInfo">
      {age && <Styled.SessionAge data-test="preFlightSessionAge">{age}</Styled.SessionAge>}
      <Styled.SessionName>{meetingName}</Styled.SessionName>
    </Styled.SessionInfo>
  );
};

export default SessionInfo;
