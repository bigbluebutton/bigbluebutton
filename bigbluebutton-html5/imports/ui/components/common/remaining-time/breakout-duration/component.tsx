import React from 'react';
import RemainingTime from '/imports/ui/components/common/remaining-time/component';
import { defineMessages, useIntl } from 'react-intl';
import { FIRST_BREAKOUT_DURATION_DATA_SUBSCRIPTION, breakoutDataResponse } from './queries';
import logger from '/imports/startup/client/logger';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { notify } from '/imports/ui/services/notification';

const intlMessages = defineMessages({
  calculatingBreakoutTimeRemaining: {
    id: 'app.calculatingBreakoutTimeRemaining',
    description: 'Message that tells that the remaining time is being calculated',
  },
  breakoutDuration: {
    id: 'app.createBreakoutRoom.duration',
    description: 'breakout duration time',
  },
});

interface BreakoutRemainingTimeContainerProps {
  boldText: boolean;
}

const BreakoutRemainingTimeContainer: React.FC<BreakoutRemainingTimeContainerProps> = ({
  boldText,
}) => {
  const intl = useIntl();
  const loadingRemainingTime = () => {
    return (
      <span>
        {intl.formatMessage(intlMessages.calculatingBreakoutTimeRemaining)}
      </span>
    );
  };

  const {
    data: breakoutData,
    loading: breakoutLoading,
    error: breakoutError,
  } = useDeduplicatedSubscription<breakoutDataResponse>(FIRST_BREAKOUT_DURATION_DATA_SUBSCRIPTION);

  if (breakoutLoading) return loadingRemainingTime();
  if (!breakoutData) return null;

  if (breakoutError) {
    notify(intl.formatMessage({
      id: 'app.error.issueLoadingData',
    }), 'warning', 'warning');
    logger.error(
      {
        logCode: 'subscription_Failed',
        extraInfo: {
          error: breakoutError,
        },
      },
      'Subscription failed to load',
    );
    return null;
  }

  const breakoutDuration: number = breakoutData.breakoutRoom[0]?.durationInSeconds;
  const breakoutStartedAt: string = breakoutData.breakoutRoom[0]?.startedAt;
  const breakoutStartedTime = new Date(breakoutStartedAt).getTime();

  const durationLabel = intlMessages.breakoutDuration;

  return (
    <RemainingTime
      referenceStartedTime={breakoutStartedTime}
      durationInSeconds={breakoutDuration}
      durationLabel={durationLabel}
      boldText={boldText}
      isBreakout={false}
    />
  );
};

export default BreakoutRemainingTimeContainer;
