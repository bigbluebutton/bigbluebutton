import { DataConsumptionHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/enums';
import { ObjectToCustomSubscriptionHookContainerMap } from '../../domain/shared/custom-subscription/types';
import { ObjectToCustomQueryHookContainerMap } from '../../domain/shared/custom-query/types';

export interface ErrorInformation {
  errorMessage: string;
  errorCode: string;
  dataConsumptionInformation: {
    query: string,
    variables?: object,
  }
}

export interface DataConsumptionFallbackHandlerProps {
  errorInformation: ErrorInformation;
  hook: DataConsumptionHooks;
  setDataConsumptionHookWithArgumentUtilizationCount: React.Dispatch<
    React.SetStateAction<Map<string, Map<
    string, ObjectToCustomSubscriptionHookContainerMap | ObjectToCustomQueryHookContainerMap
    >>>>;
}
