import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  PreFlightErrorActions,
  PreFlightErrorHeader,
} from '../component';

const intlMessages = defineMessages({
  badge: {
    id: 'app.preFlight.guestDeniedBadge',
    description: 'Condition stated above the guest denial message',
  },
  title: {
    id: 'app.preFlight.guestDeniedTitle',
    description: 'Heading of the guest denial screen',
  },
  description: {
    id: 'app.preFlight.guestDeniedDescription',
    description: 'What a denied guest can do about it',
  },
  windowTitle: {
    id: 'app.preFlight.guestDeniedWindowTitle',
    description: 'Tab title while the guest denial screen is up',
  },
  autoLeave: {
    id: 'app.preFlight.guestDeniedAutoLeave',
    description: 'Read once by screen readers: the screen takes the guest out on its own',
  },
  countdownSingular: {
    id: 'app.preFlight.guestDeniedCountdownSingular',
    description: 'Countdown to the automatic exit, with one second left',
  },
  countdownPlural: {
    id: 'app.preFlight.guestDeniedCountdownPlural',
    description: 'Countdown to the automatic exit, with several seconds left',
  },
  leaveLabel: {
    id: 'app.preFlight.leaveLabel',
    description: 'Label of the button that takes the guest out of the session',
  },
});

interface GuestDeniedHeaderProps {
  secondsLeft: number | null;
}

export const GuestDeniedHeader: React.FC<GuestDeniedHeaderProps> = ({ secondsLeft }) => {
  const intl = useIntl();

  let notice;
  if (secondsLeft !== null) {
    notice = secondsLeft === 1
      ? intl.formatMessage(intlMessages.countdownSingular)
      : intl.formatMessage(intlMessages.countdownPlural, { seconds: secondsLeft });
  }

  return (
    <PreFlightErrorHeader
      badge={intl.formatMessage(intlMessages.badge)}
      title={intl.formatMessage(intlMessages.title)}
      description={intl.formatMessage(intlMessages.description)}
      announcement={intl.formatMessage(intlMessages.autoLeave)}
      notice={notice}
      windowTitle={intl.formatMessage(intlMessages.windowTitle)}
      dataTest="preFlightGuestDenied"
    />
  );
};

interface GuestDeniedActionsProps {
  onLeave: () => void;
}

export const GuestDeniedActions: React.FC<GuestDeniedActionsProps> = ({ onLeave }) => {
  const intl = useIntl();

  return (
    <PreFlightErrorActions
      actions={[{
        label: intl.formatMessage(intlMessages.leaveLabel),
        onClick: onLeave,
        variant: 'primary',
        color: 'danger',
        dataTest: 'preFlightLeaveButton',
      }]}
    />
  );
};
