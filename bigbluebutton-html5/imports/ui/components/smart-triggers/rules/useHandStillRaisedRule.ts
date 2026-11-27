import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@apollo/client';
import { defineMessages, useIntl } from 'react-intl';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { SET_RAISE_HAND } from '/imports/ui/core/graphql/mutations/userMutations';
import useSmartTrigger from '../hooks/useSmartTrigger';
import useLocalAudioState from '../hooks/useLocalAudioState';
import { getSmartTriggersSettings, nextHandStillRaisedStage } from '../service';
import { CooldownPolicy, HandStillRaisedStage } from '../types';

const intlMessages = defineMessages({
  message: {
    id: 'app.smartTriggers.handStillRaised.message',
    description: 'Hint shown when the hand is still raised after the user spoke',
  },
  lowerHand: {
    id: 'app.smartTriggers.handStillRaised.action.lowerHand',
    description: 'Action that lowers the raised hand',
  },
});

const useHandStillRaisedRule = () => {
  const intl = useIntl();
  const { cooldownMs } = getSmartTriggersSettings().handStillRaised;
  const cooldown = useMemo<CooldownPolicy>(() => ({ kind: 'time', ms: cooldownMs }), [cooldownMs]);
  const { fire, clear } = useSmartTrigger('handStillRaised', cooldown);
  const [setRaiseHand] = useMutation(SET_RAISE_HAND);
  const { data: currentUser } = useCurrentUser((u) => ({
    userId: u.userId,
    raiseHand: u.raiseHand,
  }));
  const {
    isMuted, isTalking, isListenOnly, isConnected,
  } = useLocalAudioState();
  const [stage, setStage] = useState<HandStillRaisedStage>('idle');

  const userId = currentUser?.userId;
  const raised = !!currentUser?.raiseHand;
  const muted = isMuted || isListenOnly || !isConnected;

  useEffect(() => {
    setStage((previous) => nextHandStillRaisedStage(previous, { raised, muted, talking: isTalking }));
  }, [raised, muted, isTalking]);

  useEffect(() => {
    if (stage !== 'done' || !userId) {
      clear();
      return;
    }
    fire({
      presentation: 'toast',
      icon: 'hand',
      message: intl.formatMessage(intlMessages.message),
      actions: [{
        id: 'lowerHand',
        label: intl.formatMessage(intlMessages.lowerHand),
        onClick: () => {
          setRaiseHand({ variables: { userId, raiseHand: false } });
        },
      }],
    });
  }, [stage, userId, fire, clear, setRaiseHand]);
};

export default useHandStillRaisedRule;
