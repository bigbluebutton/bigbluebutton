import createUseSubscription from './createUseSubscription';
import CURRENT_PRESENTATION_SUBSCRIPTION from '../graphql/queries/currentPresentationSubscription';
import { CurrentPresentation } from '../../Types/presentation';

const useCurrentPresentationSubscription = createUseSubscription<Partial<CurrentPresentation>>(
  CURRENT_PRESENTATION_SUBSCRIPTION, false,
);

const useCurrentPresentation = (fn: (c: Partial<CurrentPresentation>) => Partial<CurrentPresentation>) => {
  const currentPresentation = useCurrentPresentationSubscription(fn)[0];
  return currentPresentation;
};

export default useCurrentPresentation;
