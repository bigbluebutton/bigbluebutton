import { useState, useEffect } from 'react';
import {
  CursorCoordinates,
  CursorCoordinatesResponse,
  CursorSubscriptionResponse,
  cursorUserSubscription,
  getCursorsCoordinatesStream,
  userCursorResponse,
} from './queries';
import useDeduplicatedSubscription from '../../core/hooks/useDeduplicatedSubscription';

interface mergedData extends CursorCoordinates, userCursorResponse { }

// Custom hook to fetch and merge data
export const useMergedCursorData = () => {
  const [
    cursorCoordinates,
    setCursorCoordinates,
  ] = useState<{ [key: string]: CursorCoordinates }>({});

  const [
    userCursor,
    setUserCursor,
  ] = useState<{ [key: string]: userCursorResponse }>({});

  const [
    userCursorMerged,
    setUserCursorMerged,
  ] = useState<mergedData[]>([]);
  // Fetch cursor coordinates
  const { data: cursorSubscriptionData } = useDeduplicatedSubscription<CursorSubscriptionResponse>(
    cursorUserSubscription,
  );
  const cursorSubscriptionDataString = JSON.stringify(cursorSubscriptionData);

  const { data: cursorCoordinatesData } = useDeduplicatedSubscription<CursorCoordinatesResponse>(
    getCursorsCoordinatesStream,
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
    if (cursorSubscriptionData) {
      const cursorData = cursorSubscriptionData.pres_page_cursor.reduce((acc, cursor) => {
        acc[cursor.userId] = cursor;
        return acc;
      }, {} as { [key: string]: userCursorResponse });
      setUserCursor(cursorData);
    }
  }, [cursorSubscriptionDataString]);

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
