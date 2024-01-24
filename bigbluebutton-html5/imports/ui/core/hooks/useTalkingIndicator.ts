import { DocumentNode } from 'graphql';
import createUseSubscription from './createUseSubscription';
import TALKING_INDICATOR_SUBSCRIPTION from '../graphql/queries/userVoiceSubscription';
import { UserVoice } from '/imports/ui/Types/userVoice';

const TALKING_INDICATORS_MAX = 8;

const createUseTalkingIndicatorSubscription = (
  query: DocumentNode,
  variables: object,
) => createUseSubscription<UserVoice>(
  query,
  { ...variables },
);

const useTalkingIndicator = (fn: (c: Partial<UserVoice>) => Partial<UserVoice>) => {
  const useTalkingIndicatorSubscription = createUseTalkingIndicatorSubscription(TALKING_INDICATOR_SUBSCRIPTION, {
    limit: TALKING_INDICATORS_MAX,
  });
  const loadedChatMessages = useTalkingIndicatorSubscription(fn);
  return loadedChatMessages;
};

export default useTalkingIndicator;
