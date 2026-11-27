import { useReactiveVar } from '@apollo/client';
import smartTriggersState from '../store';
import { getRuleState } from '../service';
import { Hint, RuleId } from '../types';

const useActiveHint = (ruleId: RuleId): Hint | null => {
  const state = useReactiveVar(smartTriggersState);
  return getRuleState(state, ruleId).active;
};

export default useActiveHint;
