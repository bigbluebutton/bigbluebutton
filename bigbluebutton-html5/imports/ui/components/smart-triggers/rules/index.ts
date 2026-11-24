import { RuleDefinition } from '../types';
import useTalkingWhileMutedRule from './useTalkingWhileMutedRule';
import useNoMicSignalRule from './useNoMicSignalRule';
import useHandStillRaisedRule from './useHandStillRaisedRule';
import useSpeechNotTranscribedRule from './useSpeechNotTranscribedRule';

const RULES: RuleDefinition[] = [
  { id: 'talkingWhileMuted', presentation: 'anchored', useRule: useTalkingWhileMutedRule },
  { id: 'noMicSignal', presentation: 'toast', useRule: useNoMicSignalRule },
  { id: 'handStillRaised', presentation: 'toast', useRule: useHandStillRaisedRule },
  { id: 'speechNotTranscribed', presentation: 'toast', useRule: useSpeechNotTranscribedRule },
];

export default RULES;
