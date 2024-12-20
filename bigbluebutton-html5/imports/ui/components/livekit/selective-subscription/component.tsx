import React, { useEffect } from 'react';
import { useConnectionState } from '@livekit/components-react';
import { ConnectionState, RoomEvent } from 'livekit-client';
import { liveKitRoom } from '/imports/ui/services/livekit';
import { useAudioSubscriptions } from './hooks';

const SelectiveSubscription: React.FC = () => {
  const connectionState = useConnectionState(liveKitRoom);
  const { handleSubscriptionChanges } = useAudioSubscriptions();

  useEffect(() => {
    if (connectionState !== ConnectionState.Connected) return;

    handleSubscriptionChanges();

    const onParticipantConnected = () => handleSubscriptionChanges();
    const onParticipantDisconnected = () => handleSubscriptionChanges();
    const onTrackPublished = () => handleSubscriptionChanges();
    const onTrackUnpublished = () => handleSubscriptionChanges();

    liveKitRoom.on(RoomEvent.ParticipantConnected, onParticipantConnected);
    liveKitRoom.on(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
    liveKitRoom.on(RoomEvent.TrackPublished, onTrackPublished);
    liveKitRoom.on(RoomEvent.TrackUnpublished, onTrackUnpublished);

    // eslint-disable-next-line consistent-return
    return () => {
      liveKitRoom.off(RoomEvent.ParticipantConnected, onParticipantConnected);
      liveKitRoom.off(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
      liveKitRoom.off(RoomEvent.TrackPublished, onTrackPublished);
      liveKitRoom.off(RoomEvent.TrackUnpublished, onTrackUnpublished);
    };
  }, [connectionState, handleSubscriptionChanges]);

  return null;
};

export default SelectiveSubscription;
