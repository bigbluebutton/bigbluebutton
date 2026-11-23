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
  const isConnected = useIsAudioConnected();

  return {
    inputStream,
    isMuted,
    isListenOnly,
    isEchoTest,
    isConnected,
  };
};

export default useLocalAudioState;
