import React, { useEffect } from 'react';
import { useConnectionState } from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';
import { liveKitRoomRegistry } from '/imports/ui/services/livekit';
import { type LastNInputs, useLastNInputs, useMediaSubscriptions } from './hooks';

type LastNInputsSourceProps = {
  onChange: (inputs: LastNInputs) => void;
};

// Mounted only with Last-N on, so the user, voice activity and camera reads it
// needs cost nothing otherwise.
const LastNInputsSource: React.FC<LastNInputsSourceProps> = ({ onChange }) => {
  const inputs = useLastNInputs();

  useEffect(() => onChange(inputs), [inputs, onChange]);

  return null;
};

const MemoizedLastNInputsSource = React.memo(LastNInputsSource);

const SelectiveSubscription: React.FC = () => {
  const room = liveKitRoomRegistry.getPrimary();
  const connectionState = useConnectionState(room);
  const { handleSubscriptionChanges, lastNEnabled, setLastNInputs } = useMediaSubscriptions(room);

  useEffect(() => {
    if (connectionState !== ConnectionState.Connected) return;

    handleSubscriptionChanges();
  }, [connectionState, handleSubscriptionChanges]);

  return lastNEnabled ? <MemoizedLastNInputsSource onChange={setLastNInputs} /> : null;
};

export default React.memo(SelectiveSubscription);
