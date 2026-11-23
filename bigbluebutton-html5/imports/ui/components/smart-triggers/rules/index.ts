import { RuleDefinition } from '../types';
import useTalkingWhileMutedRule from './useTalkingWhileMutedRule';

const RULES: RuleDefinition[] = [
  { id: 'talkingWhileMuted', presentation: 'anchored', useRule: useTalkingWhileMutedRule },
];

export default RULES;
