import React from 'react';
import { toast } from 'react-toastify';
import { BBButton } from '@bigbluebutton/bbb-ui-components-react';
import { notify } from '/imports/ui/services/notification';
import { Hint, HintAction, RuleId } from '../types';
import Styled from './styles';

interface HintToastActionsProps {
  ruleId: RuleId;
  actions: HintAction[];
  onAction: () => void;
}

export const getHintToastId = (ruleId: RuleId) => `smart-trigger-${ruleId}`;

// The first action is the suggested one; like a modal footer, it goes last.
const HintToastActions: React.FC<HintToastActionsProps> = ({ ruleId, actions, onAction }) => {
  const [suggested, ...others] = actions;

  return (
    <Styled.Actions>
      {[...others, suggested].map((action) => (
        <BBButton
          key={action.id}
          variant={action === suggested ? 'primary' : 'secondary'}
          size="sm"
          label={action.label}
          dataTest={`smartTrigger-${ruleId}-${action.id}`}
          onClick={() => {
            action.onClick();
            onAction();
          }}
        />
      ))}
    </Styled.Actions>
  );
};

export const showHintToast = (hint: Hint, onDismiss: () => void) => {
  const actions = hint.actions ?? [];

  notify(
    hint.message,
    'default',
    hint.icon ?? 'about',
    {
      toastId: getHintToastId(hint.ruleId),
      autoClose: false,
      onClose: onDismiss,
    },
    actions.length > 0
      ? <HintToastActions ruleId={hint.ruleId} actions={actions} onAction={onDismiss} />
      : null,
    false,
    false,
  );
};

export const hideHintToast = (ruleId: RuleId) => {
  toast.dismiss(getHintToastId(ruleId));
};
