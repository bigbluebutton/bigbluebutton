// useMeeting.ts
import { useMemo } from 'react';
import { mergeDeepRight, isEmpty } from 'ramda';
import useCreateUseSubscription from './createUseSubscription';
import MEETING_SUBSCRIPTION from '../graphql/queries/meetingSubscription';
import { Meeting } from '../../Types/meeting';
import MeetingStaticDataStore from '/imports/ui/core/singletons/meetingStaticData';
import { MeetingStaticData } from '/imports/ui/Types/meetingStaticData';

// ---------- internal helpers (DeepPartial only inside the hook)
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};
type Prettify<T> = { [K in keyof T]: T[K] } & object;
type Overlap = keyof Meeting & keyof MeetingStaticData;

// Overlaps are unions (so Meeting-only or Static-only shapes both assign)
type Combined = Prettify<
  Omit<Meeting, Overlap> &
  Omit<MeetingStaticData, Overlap> & {
    [K in Overlap]: Meeting[K] | MeetingStaticData[K];
  }
>;

// For projection results: allow *top-level* props to be partial if they are objects.
// (We stay shallow for the public type.)
type DistributePartial<T> = T extends object ? Partial<T> : T;
type Loose<T> = { [K in keyof T]?: DistributePartial<T[K]> };

// subscription remains on Meeting
const useMeetingSubscription = useCreateUseSubscription<Meeting>(
  MEETING_SUBSCRIPTION,
  {},
  true,
);

function isNilOrEmptyObject(v: unknown) {
  return v == null || (typeof v === 'object' && v !== null && isEmpty(v as object));
}

/**
 * safeProject: take a (deep-partial) source, call the projection with a *shallow* Combined view,
 * and keep only keys that exist on the source (to avoid leaking)
 */
function safeProject<
  Src extends object,
  Out extends Loose<Combined>
>(
  obj: DeepPartial<Src> | undefined,
  projectionFn: (c: Partial<Combined>) => Out,
): Out | undefined {
  if (!obj) return undefined;
  try {
    const projected = projectionFn(obj as unknown as Partial<Combined>);
    const filtered = Object.fromEntries(
      Object.entries(projected as object).filter(([key]) => key in (obj as object)),
    ) as Out;
    return Object.keys(filtered).length > 0 ? filtered : undefined;
  } catch {
    return undefined;
  }
}

export function useMeeting<T extends Loose<Combined> = Partial<Combined>>(
  fn?: (c: Partial<Combined>) => T,
) {
  const response = useMeetingSubscription();

  const data = useMemo<T | undefined>(() => {
    const live = (response.data?.[0] ?? {}) as DeepPartial<Meeting>;
    const stat = (MeetingStaticDataStore.getMeetingData() ?? {}) as DeepPartial<MeetingStaticData>;

    const project = (fn ?? ((c: Partial<Combined>) => c as T)) as (c: Partial<Combined>) => T;

    const projectedStatic = safeProject(stat, project);
    const projectedLive = safeProject(live, project);

    if (isNilOrEmptyObject(projectedStatic) && isNilOrEmptyObject(projectedLive)) return undefined;
    if (isNilOrEmptyObject(projectedStatic)) return projectedLive as T;
    if (isNilOrEmptyObject(projectedLive)) return projectedStatic as T;

    // merge (live/right overrides)
    return mergeDeepRight(projectedStatic as object, projectedLive as object) as T;
  }, [response.data, fn]);

  return useMemo(() => ({
    ...response,
    data,
  }), [response, data]);
}

export default useMeeting;
