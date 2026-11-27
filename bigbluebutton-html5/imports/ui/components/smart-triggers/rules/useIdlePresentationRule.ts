import { useEffect, useMemo, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import { defineMessages, useIntl } from 'react-intl';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { layoutDispatch, layoutSelectInput } from '/imports/ui/components/layout/context';
import { Input } from '/imports/ui/components/layout/layoutTypes';
import MediaService from '/imports/ui/components/media/service';
import useSmartTrigger from '../hooks/useSmartTrigger';
import { presentationActivityAt, presentationMounted } from '../signals';
import { getSmartTriggersSettings } from '../service';
import { CooldownPolicy } from '../types';

const intlMessages = defineMessages({
  message: {
    id: 'app.smartTriggers.idlePresentation.message',
    description: 'Hint shown to the presenter when the presentation has been idle',
  },
  minimize: {
    id: 'app.smartTriggers.idlePresentation.action.minimize',
    description: 'Action that minimizes the presentation',
  },
});

const IDLE_CHECK_INTERVAL_MS = 30000;

const useIdlePresentationRule = () => {
  const intl = useIntl();
  const { afterMinutes, cooldownMs } = getSmartTriggersSettings().idlePresentation;
  const cooldown = useMemo<CooldownPolicy>(() => ({ kind: 'time', ms: cooldownMs }), [cooldownMs]);
  const { fire, clear } = useSmartTrigger('idlePresentation', cooldown);
  const { data: currentUser } = useCurrentUser((u) => ({ presenter: u.presenter }));
  const presentationIsOpen = layoutSelectInput((i: Input) => i.presentation.isOpen);
  const layoutContextDispatch = layoutDispatch();
  const lastActivityAt = useReactiveVar(presentationActivityAt);
  // Screen sharing, external video or pinned notes take the presentation's
  // place while it stays open, so being open alone does not mean it is shown.
  const isPresentationMounted = useReactiveVar(presentationMounted);
  const [isIdle, setIsIdle] = useState(false);

  const watching = !!currentUser?.presenter && presentationIsOpen && isPresentationMounted;

  useEffect(() => {
    setIsIdle(false);
    if (!watching) return undefined;

    const watchingSince = Date.now();
    const idleCheck = setInterval(() => {
      const idleSince = Math.max(lastActivityAt, watchingSince);
      setIsIdle(Date.now() - idleSince >= afterMinutes * 60000);
    }, IDLE_CHECK_INTERVAL_MS);
    return () => clearInterval(idleCheck);
  }, [watching, lastActivityAt, afterMinutes]);

  useEffect(() => {
    if (!isIdle) {
      clear();
      return;
    }
    fire({
      presentation: 'toast',
      icon: 'presentation',
      message: intl.formatMessage(intlMessages.message),
      actions: [{
        id: 'minimize',
        label: intl.formatMessage(intlMessages.minimize),
        onClick: () => MediaService.setPresentationIsOpen(layoutContextDispatch, false),
      }],
    });
  }, [isIdle, fire, clear]);
};

export default useIdlePresentationRule;
