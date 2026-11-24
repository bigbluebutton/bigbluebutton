import { RuleDefinition } from '../types';
import useTalkingWhileMutedRule from './useTalkingWhileMutedRule';
import useSpeechNotTranscribedRule from './useSpeechNotTranscribedRule';

const RULES: RuleDefinition[] = [
  { id: 'talkingWhileMuted', presentation: 'anchored', useRule: useTalkingWhileMutedRule },
  { id: 'speechNotTranscribed', presentation: 'toast', useRule: useSpeechNotTranscribedRule },
];

export default RULES;
