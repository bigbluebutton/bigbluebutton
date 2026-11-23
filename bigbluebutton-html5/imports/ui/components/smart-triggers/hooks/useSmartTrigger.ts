import {
  useCallback, useEffect, useMemo, useRef,
} from 'react';
import {
  clearHint, dismissHint, resetRule, showHint,
} from '../service';
import { hideHintToast, showHintToast } from '../hint-toast/component';
import {
  CooldownPolicy, HintContent, RuleId, SmartTriggerController,
} from '../types';

const useSmartTrigger = (ruleId: RuleId, cooldown: CooldownPolicy): SmartTriggerController => {
  const cooldownRef = useRef(cooldown);
  cooldownRef.current = cooldown;

  const dismiss = useCallback(() => {
    const dismissed = dismissHint(ruleId, cooldownRef.current);
    if (dismissed?.presentation === 'toast') hideHintToast(ruleId);
  }, [ruleId]);

  const clear = useCallback(() => {
    const cleared = clearHint(ruleId);
    if (cleared?.presentation === 'toast') hideHintToast(ruleId);
  }, [ruleId]);

  const fire = useCallback((content: HintContent) => {
    const hint = { ...content, ruleId };
    if (!showHint(hint, cooldownRef.current)) return false;
    if (hint.presentation === 'toast') showHintToast(hint, dismiss);
    return true;
  }, [ruleId, dismiss]);

  const reset = useCallback(() => resetRule(ruleId), [ruleId]);

  useEffect(() => clear, [clear]);

  return useMemo(() => ({
    fire, clear, dismiss, reset,
  }), [fire, clear, dismiss, reset]);
};

export default useSmartTrigger;
