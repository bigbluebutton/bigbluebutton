import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import WifiOffIcon from '@mui/icons-material/WifiOffRounded';
import {
  PreFlightErrorActions,
  PreFlightErrorHeader,
} from '../component';

const intlMessages = defineMessages({
  badge: {
    id: 'app.preFlight.connectionLostBadge',
    description: 'Condition stated above the connection error message',
  },
  title: {
    id: 'app.preFlight.connectionLostTitle',
    description: 'Heading of the connection error screen',
  },
  description: {
    id: 'app.preFlight.connectionLostDescription',
    description: 'What a user who lost the connection can do about it',
  },
  stalledBadge: {
    id: 'app.preFlight.joinStalledBadge',
    description: 'Condition stated above the message of a join that got no answer',
  },
  stalledTitle: {
    id: 'app.preFlight.joinStalledTitle',
    description: 'Heading of the screen shown when a join gets no answer',
  },
  stalledDescription: {
    id: 'app.preFlight.joinStalledDescription',
    description: 'What a user whose join got no answer can do about it',
  },
  helpLabel: {
    id: 'app.preFlight.connectionLostHelp',
    description: 'Link to the help page from the connection error screen',
  },
  retryLabel: {
    id: 'app.preFlight.retryLabel',
    description: 'Label of the button that retries the connection',
  },
});

interface ConnectionLostHeaderProps {
  // The join got no answer over a socket that is still up: the network is
  // not the likely cause, so the screen does not point at it.
  joinStalled?: boolean;
}

export const ConnectionLostHeader: React.FC<ConnectionLostHeaderProps> = ({ joinStalled = false }) => {
  const intl = useIntl();
  const { helpLink } = window.meetingClientSettings.public.app;

  return (
    <PreFlightErrorHeader
      tone={joinStalled ? 'warning' : 'danger'}
      badge={intl.formatMessage(joinStalled ? intlMessages.stalledBadge : intlMessages.badge)}
      badgeIcon={joinStalled ? undefined : <WifiOffIcon />}
      title={intl.formatMessage(joinStalled ? intlMessages.stalledTitle : intlMessages.title)}
      wideTitle
      description={intl.formatMessage(joinStalled ? intlMessages.stalledDescription : intlMessages.description)}
      helpLink={{ label: intl.formatMessage(intlMessages.helpLabel), url: helpLink }}
      dataTest="preFlightConnectionLost"
    />
  );
};

interface ConnectionLostActionsProps {
  onRetry: () => void;
}

export const ConnectionLostActions: React.FC<ConnectionLostActionsProps> = ({ onRetry }) => {
  const intl = useIntl();

  return (
    <PreFlightErrorActions
      actions={[{
        label: intl.formatMessage(intlMessages.retryLabel),
        onClick: onRetry,
        variant: 'primary',
        dataTest: 'preFlightRetryButton',
      }]}
    />
  );
};
