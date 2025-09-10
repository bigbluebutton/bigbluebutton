import { useState, useEffect } from 'react';
import {
  CurrentPageWritersResponse,
  CursorCoordinates,
  CursorCoordinatesResponse,
  CURRENT_PAGE_WRITERS_SUBSCRIPTION,
  CURRENT_PAGE_CURSORS_COORDINATES_STREAM,
  UsersCurrentPageWritersResponse,
} from './queries';
import useDeduplicatedSubscription from '../../core/hooks/useDeduplicatedSubscription';

interface mergedData extends CursorCoordinates, UsersCurrentPageWritersResponse { }

// Custom hook to fetch and merge data
export const useMergedCursorData = () => {
  const [
    cursorCoordinates,
    setCursorCoordinates,
  ] = useState<{ [key: string]: CursorCoordinates }>({});

  const [
    userCursor,
    setUserCursor,
  ] = useState<{ [key: string]: UsersCurrentPageWritersResponse }>({});

  const [
    userCursorMerged,
    setUserCursorMerged,
  ] = useState<mergedData[]>([]);
  // Fetch cursor coordinates
  const { data: cursorUsersSubscriptionData } = useDeduplicatedSubscription<CurrentPageWritersResponse>(
    CURRENT_PAGE_WRITERS_SUBSCRIPTION,
  );
  const cursorUsersSubscriptionDataString = JSON.stringify(cursorUsersSubscriptionData);

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
    if (cursorUsersSubscriptionData) {
      const cursorData = cursorUsersSubscriptionData.pres_page_writers.reduce((acc, cursor) => {
        acc[cursor.userId] = cursor;
        return acc;
      }, {} as { [key: string]: UsersCurrentPageWritersResponse });
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
