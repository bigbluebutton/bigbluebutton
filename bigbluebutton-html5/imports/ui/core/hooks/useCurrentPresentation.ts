import createUseSubscription from './createUseSubscription';
import CURRENT_PRESENTATION_SUBSCRIPTION from '../graphql/queries/currentPresentationSubscription';
import { CurrentPresentation } from '../../Types/presentation';

const useCurrentPresentationSubscription = createUseSubscription<CurrentPresentation>(
  CURRENT_PRESENTATION_SUBSCRIPTION,
);

const useCurrentPresentation = (fn: (c: Partial<CurrentPresentation>) => Partial<CurrentPresentation>) => {
  const response = useCurrentPresentationSubscription(fn);
  const returnObject = {
    ...response,
    data: response.data?.[0],
  };
  return returnObject;
};

export default useCurrentPresentation;
