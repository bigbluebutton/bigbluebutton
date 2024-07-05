import { useMemo } from 'react';
import createUseSubscription from './createUseSubscription';
import CURRENT_PRESENTATION_SUBSCRIPTION from '../graphql/queries/currentPresentationSubscription';
import { CurrentPresentation } from '../../Types/presentation';

const useCurrentPresentationSubscription = createUseSubscription<CurrentPresentation>(
  CURRENT_PRESENTATION_SUBSCRIPTION,
);

const useCurrentPresentation = (fn: (c: Partial<CurrentPresentation>) => Partial<CurrentPresentation>) => {
  const response = useCurrentPresentationSubscription(fn);
  const returnObject = useMemo(() => ({
    ...response,
    data: response.data?.[0],
  }), [response]);
  return returnObject;
};

export default useCurrentPresentation;
