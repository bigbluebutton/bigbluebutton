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
  helpLabel: {
    id: 'app.preFlight.connectionLostHelp',
    description: 'Link to the help page from the connection error screen',
  },
  retryLabel: {
    id: 'app.preFlight.retryLabel',
    description: 'Label of the button that retries the connection',
  },
});

export const ConnectionLostHeader: React.FC = () => {
  const intl = useIntl();
  const { helpLink } = window.meetingClientSettings.public.app;

  return (
    <PreFlightErrorHeader
      tone="danger"
      badge={intl.formatMessage(intlMessages.badge)}
      badgeIcon={<WifiOffIcon />}
      title={intl.formatMessage(intlMessages.title)}
      wideTitle
      description={intl.formatMessage(intlMessages.description)}
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
