import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { getCurrentPollData, getCurrentPollDataResponse } from './queries';

/**
 * The running poll, plus the two aggregates every consumer needs.
 *
 * The results view and the footer actions are rendered in different subtrees but describe
 * the same poll, so they read it through here rather than each unpacking the subscription
 * payload on its own. The subscription store deduplicates the stream itself; this keeps
 * the shape of the data in one place too, so a change to the query has a single call site.
 *
 * Errors are surfaced, not handled: LiveResultContainer owns the logging so a failure is
 * reported once, no matter how many components are reading the poll.
 */
const useCurrentPoll = () => {
  const { data, loading, error } = useDeduplicatedSubscription<getCurrentPollDataResponse>(getCurrentPollData);

  const currentPoll = data?.poll?.[0];

  return {
    currentPoll,
    loading,
    error,
    numberOfAnswerCount: currentPoll?.responses_aggregate.aggregate.sum.optionResponsesCount ?? 0,
    usersCount: currentPoll?.users_aggregate.aggregate.count ?? 0,
  };
};

export default useCurrentPoll;
