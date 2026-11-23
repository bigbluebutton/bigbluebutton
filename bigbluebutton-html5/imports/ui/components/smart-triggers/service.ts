import smartTriggersState from './store';
import { audioSettingsRequest } from './signals';
import {
  CooldownPolicy,
  Hint,
  RuleId,
  RuleState,
  HandStillRaisedSignals,
  HandStillRaisedStage,
  SmartTriggersState,
} from './types';

const EMPTY_RULE_STATE: RuleState = {
  active: null, cooldown: null, suppressedUntil: 0, blocked: null,
};

export const getSmartTriggersSettings = () => window.meetingClientSettings.public.app.smartTriggers;

export const isRuleEnabled = (ruleId: RuleId): boolean => {
  const settings = getSmartTriggersSettings();
  return !!settings?.enabled && !!settings[ruleId]?.enabled;
};

export const getRuleState = (
  state: SmartTriggersState,
  ruleId: RuleId,
): RuleState => state.rules[ruleId] ?? EMPTY_RULE_STATE;

export const canShow = (state: SmartTriggersState, ruleId: RuleId, now: number): boolean => {
  const rule = getRuleState(state, ruleId);
  return !rule.blocked && now >= rule.suppressedUntil;
};

const setRuleState = (ruleId: RuleId, patch: Partial<RuleState>) => {
  const state = smartTriggersState();
  smartTriggersState({
    rules: {
      ...state.rules,
      [ruleId]: { ...getRuleState(state, ruleId), ...patch },
    },
  });
};

export const showHint = (hint: Hint, cooldown: CooldownPolicy, now = Date.now()): boolean => {
  const state = smartTriggersState();
  if (!canShow(state, hint.ruleId, now)) return false;

  const rule = getRuleState(state, hint.ruleId);
  const isNewHint = !rule.active;
  const startsTimeCooldown = isNewHint && cooldown.kind === 'time';

  setRuleState(hint.ruleId, {
    active: hint,
    cooldown,
    suppressedUntil: startsTimeCooldown ? now + cooldown.ms : rule.suppressedUntil,
  });
  return true;
};

export const clearHint = (ruleId: RuleId): Hint | null => {
  const { active } = getRuleState(smartTriggersState(), ruleId);
  if (active) setRuleState(ruleId, { active: null });
  return active;
};

export const dismissHint = (ruleId: RuleId, now = Date.now()): Hint | null => {
  const { active, cooldown } = getRuleState(smartTriggersState(), ruleId);
  if (!active || !cooldown) return null;

  if (cooldown.kind === 'time') {
    setRuleState(ruleId, { active: null, suppressedUntil: now + cooldown.ms });
  } else {
    setRuleState(ruleId, { active: null, blocked: cooldown.kind });
  }
  return active;
};

export const resetRule = (ruleId: RuleId) => {
  if (getRuleState(smartTriggersState(), ruleId).blocked === 'untilReset') {
    setRuleState(ruleId, { blocked: null });
  }
};

export const requestAudioSettings = () => {
  audioSettingsRequest(Date.now());
};

const advanceHandStillRaisedStage = (
  stage: HandStillRaisedStage,
  { muted, talking }: HandStillRaisedSignals,
): HandStillRaisedStage => {
  switch (stage) {
    case 'idle':
      return 'raised';
    case 'raised':
      return muted ? 'raised' : 'unmuted';
    case 'unmuted':
      if (muted) return 'raised';
      return talking ? 'spoke' : 'unmuted';
    case 'spoke':
      return muted ? 'done' : 'spoke';
    default:
      return stage;
  }
};

// Raised hand → unmute → speak → mute. Runs to a fixed point so a hand
// raised while already unmuted and talking moves through every stage at once.
export const nextHandStillRaisedStage = (
  stage: HandStillRaisedStage,
  signals: HandStillRaisedSignals,
): HandStillRaisedStage => {
  if (!signals.raised) return 'idle';

  let current = stage;
  let next = advanceHandStillRaisedStage(current, signals);
  while (next !== current) {
    current = next;
    next = advanceHandStillRaisedStage(current, signals);
  }
  return current;
};
