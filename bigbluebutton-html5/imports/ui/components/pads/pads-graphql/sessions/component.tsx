import { PAD_SESSION_SUBSCRIPTION, PadSessionSubscriptionResponse } from './queries';
import Service from './service';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';

const PadSessionContainerGraphql = () => {
  const { data: padSessionData } = useDeduplicatedSubscription<PadSessionSubscriptionResponse>(
    PAD_SESSION_SUBSCRIPTION,
  );

  if (padSessionData) {
    const sessions = new Set<string>();
    padSessionData.sharedNotes_session.forEach((session) => sessions.add(session.sessionId));
    Service.setCookie(Array.from(sessions));
  }

  return null;
};

export default PadSessionContainerGraphql;
