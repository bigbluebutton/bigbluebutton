import React, { useEffect } from 'react';
import { useConnectionState } from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';
import { liveKitRoom } from '/imports/ui/services/livekit';
import { useAudioSubscriptions } from './hooks';

const SelectiveSubscription: React.FC = () => {
  const connectionState = useConnectionState(liveKitRoom);
  const { handleSubscriptionChanges } = useAudioSubscriptions();

  useEffect(() => {
    if (connectionState !== ConnectionState.Connected) return;

    handleSubscriptionChanges();
  }, [connectionState, handleSubscriptionChanges]);

  return null;
};

export default React.memo(SelectiveSubscription);
