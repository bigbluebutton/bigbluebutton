import React from 'react';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { useUserLiveKitMemberships, type LiveKitRoomRow } from './hooks';
import PrimaryLiveKitRoom from '/imports/ui/components/livekit/primary-room/component';
import SecondaryLiveKitRoom from '/imports/ui/components/livekit/secondary-room/component';

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

  return (
    <>
      {memberships.map((m: LiveKitRoomRow) => {
        if (m.purpose === 'primary') return <PrimaryLiveKitRoom key={`${m.purpose}:${m.roomName}`} membership={m} />;

        return <SecondaryLiveKitRoom key={`${m.purpose}:${m.roomName}`} membership={m} />;
      })}
    </>
  );
};

export default LiveKitMembershipsManager;
