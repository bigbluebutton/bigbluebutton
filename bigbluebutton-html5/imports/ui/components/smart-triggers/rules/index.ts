import { RuleDefinition } from '../types';
import useTalkingWhileMutedRule from './useTalkingWhileMutedRule';
import useNoMicSignalRule from './useNoMicSignalRule';
import useHandStillRaisedRule from './useHandStillRaisedRule';
import useNewMicrophoneRule from './useNewMicrophoneRule';
import useRecordingWithNoSpeechRule from './useRecordingWithNoSpeechRule';
import usePresenterAwayRule from './usePresenterAwayRule';
import useSpeechNotTranscribedRule from './useSpeechNotTranscribedRule';

const RULES: RuleDefinition[] = [
  { id: 'talkingWhileMuted', presentation: 'anchored', useRule: useTalkingWhileMutedRule },
  { id: 'noMicSignal', presentation: 'toast', useRule: useNoMicSignalRule },
  { id: 'handStillRaised', presentation: 'toast', useRule: useHandStillRaisedRule },
  { id: 'newMicrophone', presentation: 'toast', useRule: useNewMicrophoneRule },
  { id: 'recordingWithNoSpeech', presentation: 'toast', useRule: useRecordingWithNoSpeechRule },
  { id: 'presenterAway', presentation: 'announcement', useRule: usePresenterAwayRule },
  { id: 'speechNotTranscribed', presentation: 'toast', useRule: useSpeechNotTranscribedRule },
];

export default RULES;
