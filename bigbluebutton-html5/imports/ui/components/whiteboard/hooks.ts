import { useState, useEffect } from 'react';
import {
  CursorCoordinates,
  CursorCoordinatesResponse,
  CURRENT_CURSORS_SUBSCRIPTION,
  CURRENT_PAGE_CURSORS_COORDINATES_STREAM,
  UserWhiteboardCursor,
  UserWhiteboardCursorResponse,
} from './queries';
import useDeduplicatedSubscription from '../../core/hooks/useDeduplicatedSubscription';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { filterByMeetingId } from '/imports/ui/core/utils/subscriptionFilters';

interface mergedData extends CursorCoordinates, UserWhiteboardCursor { }

// Custom hook to fetch and merge data
export const useMergedCursorData = () => {
  const { data: meeting } = useMeeting((m) => ({
    meetingId: m.meetingId,
  }));

  const [
    cursorCoordinates,
    setCursorCoordinates,
  ] = useState<{ [key: string]: CursorCoordinates }>({});

  const [
    userCursor,
    setUserCursor,
  ] = useState<{ [key: string]: UserWhiteboardCursor }>({});

  const [
    userCursorMerged,
    setUserCursorMerged,
  ] = useState<mergedData[]>([]);
  // Fetch cursor coordinates
  const { data: cursorUsersSubscriptionData } = useDeduplicatedSubscription<UserWhiteboardCursorResponse>(
    CURRENT_CURSORS_SUBSCRIPTION,
  );
  const filteredCursorUsers = meeting?.meetingId
    ? filterByMeetingId(
      cursorUsersSubscriptionData?.user_whiteboardCursorAccess,
      meeting.meetingId,
      CURRENT_CURSORS_SUBSCRIPTION,
      (u) => ({ mismatchedUserId: u.userId, mismatchedName: u.name }),
    )
    : [];
  const cursorUsersSubscriptionDataString = JSON.stringify(filteredCursorUsers);

  const { data: cursorCoordinatesData } = useDeduplicatedSubscription<CursorCoordinatesResponse>(
    CURRENT_PAGE_CURSORS_COORDINATES_STREAM,
  );
  const cursorCoordinatesDataString = JSON.stringify(cursorCoordinatesData);

  useEffect(() => {
    if (cursorCoordinatesData) {
      const cursorData = cursorCoordinatesData.pres_page_cursor_stream.reduce((acc, cursor) => {
        acc[cursor.userId] = cursor;
        return acc;
      }, {} as { [key: string]: CursorCoordinates });
      setCursorCoordinates((prev) => {
        return {
          ...prev,
          ...cursorData,
        };
      });
    }
  }, [cursorCoordinatesDataString]);

  useEffect(() => {
    if (filteredCursorUsers.length > 0) {
      const cursorData = filteredCursorUsers.reduce((acc, cursor) => {
        acc[cursor.userId] = cursor;
        return acc;
      }, {} as { [key: string]: UserWhiteboardCursor });
      setUserCursor(cursorData);
    }
  }, [cursorUsersSubscriptionDataString]);

  useEffect(() => {
    if (userCursor) {
      const mergedData = Object.keys(userCursor).map((userId) => {
        const cursor = userCursor[userId];
        const coordinates = cursorCoordinates[userId];
        if (coordinates) {
          return {
            ...coordinates,
            ...cursor,
          };
        }

        return {
          ...cursor,
          userId,
          xPercent: -1,
          yPercent: -1,
        };
      }) as mergedData[];
      setUserCursorMerged(mergedData);
    }
  }, [cursorCoordinates, userCursor]);

  return userCursorMerged;
};

export default {
  useMergedCursorData,
};
