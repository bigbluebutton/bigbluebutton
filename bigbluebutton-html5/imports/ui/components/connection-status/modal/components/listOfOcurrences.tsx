import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis,
} from 'recharts';
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
  recentReportsToggle: {
    id: 'app.connection-status.recentReportsToggle',
  },
  timelineTitle: {
    id: 'app.connection-status.timelineTitle',
  },
  timelineAriaLabel: {
    id: 'app.connection-status.timelineAriaLabel',
  },
  normalLabel: {
    id: 'app.connection-status.normalLabel',
  },
  warningLabel: {
    id: 'app.connection-status.warningLabel',
  },
  dangerLabel: {
    id: 'app.connection-status.dangerLabel',
  },
  criticalLabel: {
    id: 'app.connection-status.criticalLabel',
  },
});

const RECENT_REPORTS_LIST_ID = 'connection-status-recent-reports';

const STATUS_LEVELS = {
  normal: 0,
  warning: 1,
  danger: 2,
  critical: 3,
};

const ListOfOcurrences: React.FC<ListOfOcurrencesProps> = ({
  statusHistory,
}) => {
  const intl = useIntl();
  const [currentLocale] = useCurrentLocale();
  const [timeSync] = useTimeSync();
  // The report list is long and secondary to the timeline above it, so it starts collapsed.
  const [reportsExpanded, setReportsExpanded] = useState(false);
  const toggleReports = () => setReportsExpanded((expanded) => !expanded);
  const formatTime = (timestamp: number) => new Intl.DateTimeFormat(currentLocale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: undefined,
  }).format(new Date(timestamp + timeSync));
  const statusLabels = [
    intl.formatMessage(intlMessages.normalLabel),
    intl.formatMessage(intlMessages.warningLabel),
    intl.formatMessage(intlMessages.dangerLabel),
    intl.formatMessage(intlMessages.criticalLabel),
  ];
  const chartData = [...statusHistory].reverse().map((status) => ({
    timestamp: new Date(status.statusUpdatedAt).getTime(),
    status: STATUS_LEVELS[status.status as keyof typeof STATUS_LEVELS],
  }));
  return (
    <Styled.ListOccurrenceContainer>
      <Styled.TimelineChartContainer
        data-test="connectionStatusTimelineChart"
        role="img"
        aria-label={intl.formatMessage(intlMessages.timelineAriaLabel)}
      >
        <Styled.TimelineChartTitle>
          {intl.formatMessage(intlMessages.timelineTitle)}
        </Styled.TimelineChartTitle>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 4, right: 20, bottom: 4, left: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              domain={['dataMin', 'dataMax']}
              tickFormatter={formatTime}
              type="number"
            />
            <YAxis
              domain={[0, 3]}
              interval={0}
              ticks={[0, 1, 2, 3]}
              tickFormatter={(level) => statusLabels[level]}
              type="number"
              width={65}
            />
            <Line
              dataKey="status"
              dot
              isAnimationActive={false}
              stroke="#0F70D7"
              strokeWidth={2}
              type="stepAfter"
            />
          </LineChart>
        </ResponsiveContainer>
      </Styled.TimelineChartContainer>
      <Styled.OccurrenceListToggle
        role="button"
        tabIndex={0}
        aria-expanded={reportsExpanded}
        aria-controls={RECENT_REPORTS_LIST_ID}
        aria-label={intl.formatMessage(intlMessages.recentReportsToggle)}
        data-test="connectionStatusRecentReportsToggle"
        onClick={toggleReports}
        onKeyDown={(event: React.KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleReports();
          }
        }}
      >
        {intl.formatMessage(intlMessages.recentReport)}
        <Styled.Chevron iconName="device_list_selector" isOpen={reportsExpanded} />
      </Styled.OccurrenceListToggle>
      <Styled.OccurrenceList
        id={RECENT_REPORTS_LIST_ID}
        data-test="connectionStatusRecentReportsList"
      >
        {reportsExpanded && statusHistory.map((status, index) => {
          const statusUpdatedAt = new Date(status.statusUpdatedAt);
          return (
            <Styled.OccurrenceListItem
            // eslint-disable-next-line react/no-array-index-key
              key={index}
              data-test="connectionStatusHistoryEntry"
            >
              <Styled.OccurrenceListItemIcon status={status.status} />
              {
                intl
                  .formatMessage(
                    intlMessages[status.status as keyof typeof intlMessages],
                    {
                      0: status.networkRttInMs,
                      1: formatTime(statusUpdatedAt.getTime()),
                    },
                  )
              }
            </Styled.OccurrenceListItem>
          );
        })}
      </Styled.OccurrenceList>
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

  if (connectionStatusHistoryLoading) {
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

  if (!connectionStatusHistoryData) {
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
