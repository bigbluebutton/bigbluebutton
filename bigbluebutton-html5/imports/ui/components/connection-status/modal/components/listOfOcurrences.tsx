import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { CONNECTION_STATUS_HISTORY, ConnectionStatusHistory, ConnectionStatusResponse } from '../../queries';
import logger from '/imports/startup/client/logger';
import connectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import Styled from '../styles';
import useCurrentLocale from '/imports/ui/core/local-states/useCurrentLocale';
import useTimeSync from '/imports/ui/core/local-states/useTimeSync';

interface ListOfOcurrencesContainerProps {
  userId: string;
}

interface ListOfOcurrencesProps {
  statusHistory: ConnectionStatusHistory[];
}

const intlMessages = defineMessages({
  normal: {
    id: 'app.connection-status.statusNormal',
  },
  warning: {
    id: 'app.connection-status.statusWarning',
  },
  danger: {
    id: 'app.connection-status.statusDanger',
  },
  critical: {
    id: 'app.connection-status.statusCritical',
  },
  recentReport: {
    id: 'app.connection-status.recentReports',
  },
});

const ListOfOcurrences: React.FC<ListOfOcurrencesProps> = ({
  statusHistory,
}) => {
  const intl = useIntl();
  const [currentLocale] = useCurrentLocale();
  const [timeSync] = useTimeSync();
  return (
    <Styled.ListOccurrenceContainer>
      <Styled.OccurrenceListHeader>
        {intl.formatMessage(intlMessages.recentReport)}
      </Styled.OccurrenceListHeader>
      {
        statusHistory.map((status, index) => {
          const statusUpdatedAt = new Date(status.statusUpdatedAt);
          return (
            <Styled.OccurrenceListItem
            // eslint-disable-next-line react/no-array-index-key
              key={index}
            >
              <Styled.OccurrenceListItemIcon status={status.status} />
              {
                intl
                  .formatMessage(
                    intlMessages[status.status as keyof typeof intlMessages],
                    {
                      0: status.networkRttInMs,
                      1: new Intl.DateTimeFormat(currentLocale, {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: undefined, // Uses locale default (12h or 24h)
                      }).format(new Date(statusUpdatedAt.getTime() + timeSync)),
                    },
                  )
              }
            </Styled.OccurrenceListItem>
          );
        })
      }
    </Styled.ListOccurrenceContainer>
  );
};

const ListOfOcurrencesContainer: React.FC<ListOfOcurrencesContainerProps> = ({
  userId,
}) => {
  const {
    data: connectionStatusHistoryData,
    loading: connectionStatusHistoryLoading,
    error: connectionStatusHistoryError,
  } = useDeduplicatedSubscription<ConnectionStatusResponse>(CONNECTION_STATUS_HISTORY, {
    variables: {
      userId,
    },
  });

  if (connectionStatusHistoryLoading || !connectionStatusHistoryData) {
    return null;
  }

  if (connectionStatusHistoryError) {
    connectionStatus.setSubscriptionFailed(true);
    logger.error(
      {
        logCode: 'subscription_Failed',
        extraInfo: {
          error: connectionStatusHistoryError,
        },
      },
      'Subscription failed to load',
    );
    return null;
  }

  return (
    <ListOfOcurrences
      statusHistory={(connectionStatusHistoryData as ConnectionStatusResponse)
        .user_connectionStatusHistory}
    />
  );
};

export default ListOfOcurrencesContainer;
