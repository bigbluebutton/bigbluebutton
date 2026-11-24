import { type ClientSettingsOverrides } from '../core/page';

type RuleName = 'talkingWhileMuted' | 'noMicSignal';

// Every rule off, so each test turns on only the rule it covers and no other
// hint can appear in its way. The full block is sent because servers whose
// packaged settings predate smart triggers have none of these keys.
const ALL_RULES_OFF = {
  enabled: true,
  talkingWhileMuted: { enabled: false, speechThresholdDb: -50, hideAfterMs: 4000 },
  noMicSignal: { enabled: false, afterSeconds: 6, signalFloorDb: -95, cooldownMs: 300000 },
  speechNotTranscribed: {
    enabled: false,
    speechThresholdDb: -50,
    afterSpeakingSeconds: 5,
    hideAfterMs: 10000,
    helpLink: '',
  },
};

export const smartTriggersOverride = (
  rule: RuleName,
  ruleSettings: Record<string, number> = {},
): ClientSettingsOverrides => ({
  public: {
    app: {
      smartTriggers: {
        ...ALL_RULES_OFF,
        [rule]: { ...ALL_RULES_OFF[rule], ...ruleSettings, enabled: true },
      },
    },
  },
});
