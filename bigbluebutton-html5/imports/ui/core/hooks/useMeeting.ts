// useMeeting.ts
import { useMemo } from 'react';
import { mergeDeepRight, isEmpty } from 'ramda';
import useCreateUseSubscription from './createUseSubscription';
import MEETING_SUBSCRIPTION from '../graphql/queries/meetingSubscription';
import { Meeting } from '../../Types/meeting';
import MeetingStaticDataStore from '/imports/ui/core/singletons/meetingStaticData';

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? U[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

const useMeetingSubscription = useCreateUseSubscription<Meeting>(
  MEETING_SUBSCRIPTION,
  {},
  true,
);

function isNilOrEmptyObject(v: unknown) {
  return v == null || (typeof v === 'object' && v !== null && isEmpty(v as unknown));
}

function safeProject<T>(
  obj: Partial<T> | undefined,
  projectionFn: (c: Partial<T>) => Partial<T>,
): Partial<T> | undefined {
  if (!obj) return undefined;

  try {
    const projected = projectionFn(obj);
    // Verify: only keep keys that exist in the original object
    const filtered = Object.fromEntries(
      Object.entries(projected).filter(([key]) => key in obj),
    ) as Partial<T>;

    return Object.keys(filtered).length > 0 ? filtered : undefined;
  } catch (err) {
    return undefined;
  }
}

export const useMeeting = (fn: (c: Partial<Meeting>) => Partial<Meeting>) => {
  const response = useMeetingSubscription();

  const data = useMemo(() => {
    // sources
    const live = (response.data?.[0] ?? {});
    const stat = (MeetingStaticDataStore.getMeetingData() ?? {});

    // run projection on each source independently
    const projectedStatic = safeProject(stat, fn);
    const projectedLive = safeProject(live, fn);

    // decide what to return
    if (isNilOrEmptyObject(projectedStatic) && isNilOrEmptyObject(projectedLive)) {
      return undefined;
    }
    if (isNilOrEmptyObject(projectedStatic)) {
      return projectedLive;
    }
    if (isNilOrEmptyObject(projectedLive)) {
      return projectedStatic;
    }

    // both present → deep merge (right/live overrides)
    return mergeDeepRight(
      projectedStatic as DeepPartial<Meeting>,
      projectedLive as DeepPartial<Meeting>,
    ) as Partial<Meeting>;
  }, [response.data, MeetingStaticDataStore.hasData(), fn]);

  return useMemo(() => ({ ...response, data }), [response, data]);
};

export default useMeeting;
