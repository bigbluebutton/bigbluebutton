/* eslint-disable no-underscore-dangle */
import { useReactiveVar } from '@apollo/client';
import AudioManager from '/imports/ui/services/audio-manager';

export const useIsAudioConnected = ({ ignoreDeafened = false } = {}): boolean => {
  // @ts-ignore
  const isConnected = useReactiveVar(AudioManager._isConnected.value) as boolean;
  // @ts-ignore
  const isDeafened = useReactiveVar(AudioManager._isDeafened.value) as boolean;

  return isConnected && (!isDeafened || ignoreDeafened);
};

export default useIsAudioConnected;
