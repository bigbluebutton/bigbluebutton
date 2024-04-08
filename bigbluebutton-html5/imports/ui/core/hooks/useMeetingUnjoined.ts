import { useSubscription } from './createUseSubscription';
import { MEETING_UNJOINED_SUBSCRIPTION } from '../graphql/queries/meetingUnjoinedSubscription';
import { MeetingUnjoined } from '../../Types/meeting';

export const useMeetingUnjoined = <P extends (meeting: MeetingUnjoined) => ReturnType<P>>(projection: P) => {
  const response = useSubscription<MeetingUnjoined>(MEETING_UNJOINED_SUBSCRIPTION);
  return {
    ...response,
    data: response.data ? response.data.map(projection)[0] : null,
  };
};

export default useMeetingUnjoined;
