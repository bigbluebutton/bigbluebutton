import React from 'react';
import RULES from './rules';
import { isRuleEnabled } from './service';
import { RuleDefinition } from './types';

interface SmartTriggersProps {
  toastsVisible: boolean;
}

interface RuleHostProps {
  useRule: RuleDefinition['useRule'];
}

const RuleHost: React.FC<RuleHostProps> = ({ useRule }) => {
  useRule();
  return null;
};

const SmartTriggers: React.FC<SmartTriggersProps> = ({ toastsVisible }) => (
  <>
    {RULES
      .filter((rule) => isRuleEnabled(rule.id))
      .filter((rule) => rule.presentation === 'anchored' || toastsVisible)
      .map((rule) => <RuleHost key={rule.id} useRule={rule.useRule} />)}
  </>
);

export default SmartTriggers;
