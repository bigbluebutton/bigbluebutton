/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { makeCustomHookIdentifierFromArgs } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/utils';
import { DataConsumptionHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/enums';
import { CustomDataConsumptionHooksErrorBoundaryProps } from './types';
import ErrorBoundary from '../../../common/error-boundary/component';
import FallbackHandler from './fallback-handler/handler';
import { ErrorInformation } from './fallback-handler/types';

const CustomDataConsumptionHooksErrorBoundary: React.FC<CustomDataConsumptionHooksErrorBoundaryProps> = (
  props: CustomDataConsumptionHooksErrorBoundaryProps,
) => {
  const {
    children,
    hookWithArguments,
    dataConsumptionHook,
    setDataConsumptionHookWithArgumentUtilizationCount,
  } = props;
  const {
    query,
    variables,
  } = hookWithArguments.hookArguments;
  let errorMessage;
  let logMetadata;
  if (dataConsumptionHook === DataConsumptionHooks.CUSTOM_SUBSCRIPTION) {
    errorMessage = `
      Error while querying custom subscriptions for plugins`;
    logMetadata = {
      logCode: 'plugin_custom_subscription_error',
      logMessage: errorMessage,
    };
  } else {
    errorMessage = `
      Error while trying to fetch data via custom query for plugin`;
    logMetadata = {
      logCode: 'plugin_custom_query_error',
      logMessage: errorMessage,
    };
  }
  const errorInformation = {
    errorMessage,
    errorCode: logMetadata.logCode,
    dataConsumptionInformation: {
      query,
      variables,
    },
  } as ErrorInformation;
  return (
    <ErrorBoundary
      key={makeCustomHookIdentifierFromArgs(hookWithArguments.hookArguments)}
      Fallback={() => {
        return (
          <FallbackHandler
            errorInformation={errorInformation}
            hook={dataConsumptionHook}
            setDataConsumptionHookWithArgumentUtilizationCount={setDataConsumptionHookWithArgumentUtilizationCount}
          />
        );
      }}
      logMetadata={logMetadata}
      errorMessage={errorMessage}
      errorInfo={
        {
          subscriptionData: {
            query,
            variables,
          },
        }
      }
    >
      {children}
    </ErrorBoundary>
  );
};

export default CustomDataConsumptionHooksErrorBoundary;
