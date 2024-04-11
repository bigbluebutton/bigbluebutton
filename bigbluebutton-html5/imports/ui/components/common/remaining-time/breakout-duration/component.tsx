import React from 'react';
import RemainingTime from '/imports/ui/components/common/remaining-time/component';
import { defineMessages, useIntl } from 'react-intl';
import { useSubscription } from '@apollo/client';
import { FIRST_BREAKOUT_DURATION_DATA_SUBSCRIPTION, breakoutDataResponse } from './queries';
import logger from '/imports/startup/client/logger';

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
  } = useSubscription<breakoutDataResponse>(FIRST_BREAKOUT_DURATION_DATA_SUBSCRIPTION);

  if (breakoutLoading) return loadingRemainingTime();
  if (!breakoutData) return null;
  if (breakoutError) {
    logger.error('Error when loading breakout data', breakoutError);
    return (
      <div>
        Error:
        {JSON.stringify(breakoutError)}
      </div>
    );
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
