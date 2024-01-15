import { useSubscription } from '@apollo/client';
import { PAD_SESSION_SUBSCRIPTION, PadSessionSubscriptionResponse } from './queries';
import Service from './service';

const PadSessionContainerGraphql = () => {
  const { data: padSessionData } = useSubscription<PadSessionSubscriptionResponse>(PAD_SESSION_SUBSCRIPTION);

  if (padSessionData) {
    const sessions = new Set<string>();
    padSessionData.sharedNotes_session.forEach((session) => sessions.add(session.sessionId));
    Service.setCookie(Array.from(sessions));
  }

  return null;
};

export default PadSessionContainerGraphql;
