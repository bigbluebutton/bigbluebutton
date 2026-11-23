import { RuleDefinition } from '../types';
import useTalkingWhileMutedRule from './useTalkingWhileMutedRule';
import useNoMicSignalRule from './useNoMicSignalRule';
import useHandStillRaisedRule from './useHandStillRaisedRule';

const RULES: RuleDefinition[] = [
  { id: 'talkingWhileMuted', presentation: 'anchored', useRule: useTalkingWhileMutedRule },
  { id: 'noMicSignal', presentation: 'toast', useRule: useNoMicSignalRule },
  { id: 'handStillRaised', presentation: 'toast', useRule: useHandStillRaisedRule },
];

export default RULES;
