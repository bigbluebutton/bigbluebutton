/* eslint-disable no-underscore-dangle */
import { useReactiveVar } from '@apollo/client';
import AudioManager from '/imports/ui/services/audio-manager';
import useIsAudioConnected from '/imports/ui/components/audio/audio-graphql/hooks/useIsAudioConnected';
import { LocalAudioState } from '../types';

const useLocalAudioState = (): LocalAudioState => {
  // @ts-ignore - AudioManager is untyped JS
  const inputStream = useReactiveVar(AudioManager._inputStream) as MediaStream | null;
  // @ts-ignore - AudioManager is untyped JS
  const isMuted = useReactiveVar(AudioManager._isMuted.value) as boolean;
  // @ts-ignore - AudioManager is untyped JS
  const isListenOnly = useReactiveVar(AudioManager._isListenOnly.value) as boolean;
  // @ts-ignore - AudioManager is untyped JS
  const isEchoTest = useReactiveVar(AudioManager._isEchoTest.value) as boolean;
  // @ts-ignore - AudioManager is untyped JS
  const isTalking = useReactiveVar(AudioManager._isTalking.value) as boolean;
  // @ts-ignore - AudioManager is untyped JS
  const inputDeviceId = useReactiveVar(AudioManager._inputDeviceId.value) as string | null;
  const isConnected = useIsAudioConnected();

  return {
    inputStream,
    isMuted,
    isListenOnly,
    isEchoTest,
    isTalking,
    inputDeviceId,
    isConnected,
  };
};

export default useLocalAudioState;
