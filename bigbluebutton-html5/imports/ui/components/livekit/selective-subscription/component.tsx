import React, { useEffect } from 'react';
import { useConnectionState } from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';
import { liveKitRoomRegistry } from '/imports/ui/services/livekit';
import { useMediaSubscriptions } from './hooks';

const SelectiveSubscription: React.FC = () => {
  const room = liveKitRoomRegistry.getPrimary();
  const connectionState = useConnectionState(room);
  const { handleSubscriptionChanges } = useMediaSubscriptions(room);

  useEffect(() => {
    if (connectionState !== ConnectionState.Connected) return;

    handleSubscriptionChanges();
  }, [connectionState, handleSubscriptionChanges]);

  return null;
};

export default React.memo(SelectiveSubscription);
