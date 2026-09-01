import React from 'react';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { useUserLiveKitMemberships, type LiveKitRoomRow } from './hooks';
import PrimaryLiveKitRoom from '/imports/ui/components/livekit/primary-room/component';
import SecondaryLiveKitRoom from '/imports/ui/components/livekit/secondary-room/component';
import BreakoutListenRoom from '/imports/ui/components/livekit/breakout-listen-room/component';

const renderMembership = (m: LiveKitRoomRow) => {
  const key = `${m.purpose}:${m.roomName}`;

  switch (m.purpose) {
    case 'primary':
      return <PrimaryLiveKitRoom key={key} membership={m} />;
    case 'breakout-listen':
      return <BreakoutListenRoom key={key} membership={m} />;
    default:
      return <SecondaryLiveKitRoom key={key} membership={m} />;
  }
};

const LiveKitMembershipsManager: React.FC = () => {
  const { data: bridges } = useMeeting((m) => ({
    cameraBridge: m.cameraBridge,
    screenShareBridge: m.screenShareBridge,
    audioBridge: m.audioBridge,
  }));

  const shouldUseLiveKit = bridges?.cameraBridge === 'livekit'
    || bridges?.screenShareBridge === 'livekit'
    || bridges?.audioBridge === 'livekit';

  const memberships = useUserLiveKitMemberships();

  if (!shouldUseLiveKit) return null;

  return <>{memberships.map(renderMembership)}</>;
};

export default LiveKitMembershipsManager;
