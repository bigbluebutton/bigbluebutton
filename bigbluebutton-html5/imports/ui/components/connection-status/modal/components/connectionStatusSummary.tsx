import React, { useCallback, useEffect, useState } from 'react';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import connectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';
import Tooltip from '/imports/ui/components/common/tooltip/component';
import logger from '/imports/startup/client/logger';
import { CONNECTION_STATUS_SUMARY, ConnectionStatusSummary, ConnectionStatusSummaryResponse } from '../../queries';
import Styled from '../styles';

interface ConnectionStatusSummaryContainerProps {
  userId: string;
}

interface ConnectionStatusSummaryProps {
  statusesSummary: ConnectionStatusSummary;
}

const ConnectionStatusSummaryComponent: React.FC<ConnectionStatusSummaryProps> = ({
  statusesSummary,
}) => {
  const [
    statusesMetrics,
    setStatuesMetrics,
  ] = useState<{
    normal: {
      occurrences: number;
      percentage: number;
    };
    warning: {
      occurrences: number;
      percentage: number;
    };
    danger: {
      occurrences: number;
      percentage: number;
    };
    critical: {
      occurrences: number;
      percentage: number;
    };
  }>({
    normal: {
      occurrences: 0,
      percentage: 0,
    },
    warning: {
      occurrences: 0,
      percentage: 0,
    },
    danger: {
      occurrences: 0,
      percentage: 0,
    },
    critical: {
      occurrences: 0,
      percentage: 0,
    },
  });

  const calculateEventPercentage = useCallback((eventOccurrences: number, totalOccurrences: number): number => {
    if (totalOccurrences === 0) return 0; // Avoid division by zero
    const percentage = (eventOccurrences / totalOccurrences) * 100;
    return parseFloat(percentage.toFixed(2)); // Ensures 2 decimal places and returns as number
  }, []);

  useEffect(() => {
    const normalPercentage = calculateEventPercentage(
      statusesSummary.statusNormalOccurrences,
      statusesSummary.totalOfOccurrences,
    );
    const warningPercentage = calculateEventPercentage(
      statusesSummary.statusWarningOccurrences,
      statusesSummary.totalOfOccurrences,
    );
    const dangerPercentage = calculateEventPercentage(
      statusesSummary.statusDangerOccurrences,
      statusesSummary.totalOfOccurrences,
    );
    const criticalPercentage = calculateEventPercentage(
      statusesSummary.statusCriticalOccurrences,
      statusesSummary.totalOfOccurrences,
    );

    setStatuesMetrics({
      normal: {
        occurrences: statusesSummary.statusNormalOccurrences,
        percentage: normalPercentage,
      },
      warning: {
        occurrences: statusesSummary.statusWarningOccurrences,
        percentage: warningPercentage,
      },
      danger: {
        occurrences: statusesSummary.statusDangerOccurrences,
        percentage: dangerPercentage,
      },
      critical: {
        occurrences: statusesSummary.statusCriticalOccurrences,
        percentage: criticalPercentage,
      },
    });
  }, [
    statusesSummary.statusNormalOccurrences,
    statusesSummary.statusWarningOccurrences,
    statusesSummary.statusDangerOccurrences,
    statusesSummary.statusCriticalOccurrences,
  ]);

  return (
    <Styled.MetricsContainer>
      <Styled.ColorIndicatorContainer>
        {Object.entries(statusesMetrics).map(([status, values]) => {
          return (
            <Styled.ColorIndicators
              status={status}
              width={values.percentage}
            />
          );
        })}
      </Styled.ColorIndicatorContainer>
      <Styled.MetricsTable>
        <tbody>
          <tr>
            {Object.keys(statusesMetrics).map((status, index, arr) => (
              <Styled.MetricsTableHeader
                key={status}
                last={index + 1 === arr.length}
              >
                {status}
              </Styled.MetricsTableHeader>
            ))}
          </tr>
          <tr>
            {Object.values(statusesMetrics).map((values, index, arr) => (
              <Styled.MetricsTableData
                // eslint-disable-next-line react/no-array-index-key
                key={`status-percent-row-${index}`}
                last={index + 1 === arr.length}
              >
                <Tooltip
                  title={values.occurrences}
                  // eslint-disable-next-line react/no-array-index-key
                  key={`status-tooltip-${index}`}
                >
                  <span>
                    {values.percentage}
                    %
                  </span>
                </Tooltip>
              </Styled.MetricsTableData>
            ))}
          </tr>
        </tbody>
      </Styled.MetricsTable>
    </Styled.MetricsContainer>
  );
};

const ConnectionStatusSummaryContainer: React.FC<ConnectionStatusSummaryContainerProps> = ({
  userId,
}) => {
  const {
    data: connectionStatusSummaryData,
    loading: connectionStatusSummaryLoading,
    error: connectionStatusSummaryError,
  } = useDeduplicatedSubscription<ConnectionStatusSummaryResponse>(CONNECTION_STATUS_SUMARY, {
    variables: {
      userId,
    },
  });

  if (connectionStatusSummaryLoading || !connectionStatusSummaryData) {
    return null;
  }

  if (connectionStatusSummaryError) {
    connectionStatus.setSubscriptionFailed(true);
    logger.error(
      {
        logCode: 'subscription_Failed',
        extraInfo: {
          error: connectionStatusSummaryError,
        },
      },
      'Subscription failed to load',
    );
    return null;
  }

  return (
    <ConnectionStatusSummaryComponent
      statusesSummary={connectionStatusSummaryData.user_connectionStatusSummary[0]}
    />
  );
};

export default ConnectionStatusSummaryContainer;
