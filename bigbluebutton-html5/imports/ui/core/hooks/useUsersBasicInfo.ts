import { useMemo } from 'react';
import createUseSubscription from './createUseSubscription';
import useMeeting from './useMeeting';
import { UserBasicInfo } from '../../Types/user';
import USERS_BASIC_INFO_SUBSCRIPTION from '../graphql/queries/usersBasicInfo';
import { filterByMeetingId } from '../utils/subscriptionFilters';

const useUsersBasicInfoSubscription = createUseSubscription<UserBasicInfo>(
  USERS_BASIC_INFO_SUBSCRIPTION,
  {},
  true,
);

const useUsersBasicInfo = (fn: (c: Partial<UserBasicInfo>) => Partial<UserBasicInfo>) => {
  const response = useUsersBasicInfoSubscription(fn);

  const { data: meeting } = useMeeting((m) => ({
    meetingId: m.meetingId,
  }));

  const filteredData = useMemo(() => {
    if (!response.data || !meeting?.meetingId) {
      return response.data;
    }
    return filterByMeetingId(
      response.data,
      meeting.meetingId,
      USERS_BASIC_INFO_SUBSCRIPTION,
      (u) => ({ mismatchedUserId: u.userId, mismatchedName: u.name }),
    );
  }, [response.data, meeting?.meetingId]);

  const returnObject = useMemo(() => ({
    ...response,
    data: filteredData || undefined,
  }), [response, filteredData]);

  return returnObject;
};

export default useUsersBasicInfo;
