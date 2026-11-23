export type RuleId =
  | 'talkingWhileMuted'
  | 'noMicSignal'
  | 'handStillRaised'
  | 'newMicrophone'
  | 'recordingWithNoSpeech'
  | 'presenterAway'
  | 'idlePresentation';

export type CooldownPolicy =
  | { kind: 'time'; ms: number }
  | { kind: 'untilReset' }
  | { kind: 'session' };

export type BlockingCooldown = Exclude<CooldownPolicy['kind'], 'time'>;

export type HintPresentation = 'toast' | 'anchored';

export interface HintAction {
  id: string;
  label: string;
  onClick: () => void;
}

export interface HintContent {
  presentation: HintPresentation;
  message: string;
  icon?: string;
  actions?: HintAction[];
}

export interface Hint extends HintContent {
  ruleId: RuleId;
}

export interface RuleState {
  active: Hint | null;
  suppressedUntil: number;
  blocked: BlockingCooldown | null;
}

export interface SmartTriggersState {
  rules: Partial<Record<RuleId, RuleState>>;
}

export interface SmartTriggerController {
  fire: (content: HintContent) => boolean;
  clear: () => void;
  dismiss: () => void;
  reset: () => void;
}

export interface RuleDefinition {
  id: RuleId;
  presentation: HintPresentation;
  useRule: () => void;
}
