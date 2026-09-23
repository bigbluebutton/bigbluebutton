import React from 'react';
import Styled from './styles';

interface SessionInfoProps {
  meetingName: string;
}

const SessionInfo: React.FC<SessionInfoProps> = ({ meetingName }) => (
  <Styled.SessionInfo data-test="preFlightSessionInfo">
    <Styled.SessionName>{meetingName}</Styled.SessionName>
  </Styled.SessionInfo>
);

export default SessionInfo;
