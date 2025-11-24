// useMeeting.ts
import { useMemo } from 'react';
import { mergeDeepRight, isEmpty } from 'ramda';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import useStableResponse, { precompareResponses } from './useStableResponse';
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

  // Build the final return value and avoid returning a new object reference
  // when the combined shape didn't change (shallow compare top-level keys).
  const combined = useMemo(() => ({
    ...response,
    data,
  }), [response, data]);

  function shallowEqualData<T>(a?: T, b?: T): boolean {
    if (a === b) return true;
    if (!a && !b) return true;
    if (!a || !b) return false;
    if (typeof a !== 'object' || typeof b !== 'object') return false;
    const aKeys = Object.keys(a as object);
    const bKeys = Object.keys(b as object);
    if (aKeys.length !== bKeys.length) return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aAny = a as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bAny = b as any;
    for (let i = 0; i < aKeys.length; i += 1) {
      const key = aKeys[i] as string;
      if (aAny[key] !== bAny[key]) return false;
    }
    return true;
  }
  // Prefer the shared stable response hook so callers get a stable reference
  // when the top-level projected data and loading flag are shallow-equal.
  // Specialized comparator for meetings: use the concrete `Meeting` type to
  // compare the fields we care about. This avoids returning a new reference
  // when the subscription recreates equivalent meeting objects.
  const meetingComparator = (
    a: GraphqlDataHookSubscriptionResponse<T> | null,
    b: GraphqlDataHookSubscriptionResponse<T>,
  ) => {
    const pre = precompareResponses<Partial<Meeting>>(
      a as unknown as GraphqlDataHookSubscriptionResponse<Partial<Meeting>> | null,
      b as unknown as GraphqlDataHookSubscriptionResponse<Partial<Meeting>>,
    );
    if (pre === true) return true;
    if (pre === false) return false;
    const { aData: aRaw, bData: bRaw } = pre;
    const aData = aRaw as Partial<Meeting> | undefined;
    const bData = bRaw as Partial<Meeting> | undefined;
    if (!aData && !bData) return true;
    if (!aData || !bData) return false;

    if ((aData.meetingId ?? '') !== (bData.meetingId ?? '')) return false;
    if (!!aData.isBreakout !== !!bData.isBreakout) return false;

    // Basic primitives
    if ((aData.createdTime ?? 0) !== (bData.createdTime ?? 0)) return false;
    if ((aData.durationInSeconds ?? 0) !== (bData.durationInSeconds ?? 0)) return false;
    if ((aData.extId ?? '') !== (bData.extId ?? '')) return false;
    if ((aData.name ?? '') !== (bData.name ?? '')) return false;
    if ((aData.notifyRecordingIsOn ?? false) !== (bData.notifyRecordingIsOn ?? false)) return false;
    if ((aData.presentationUploadExternalDescription ?? '') !== (bData.presentationUploadExternalDescription ?? '')) return false;
    if ((aData.presentationUploadExternalUrl ?? '') !== (bData.presentationUploadExternalUrl ?? '')) return false;
    if ((aData.maxPinnedCameras ?? 0) !== (bData.maxPinnedCameras ?? 0)) return false;
    if ((aData.meetingCameraCap ?? 0) !== (bData.meetingCameraCap ?? 0)) return false;

    // Arrays and objects — use shallowEqualData which compares top-level keys/values
    const aDisabled = aData.disabledFeatures as string[];
    const bDisabled = bData.disabledFeatures as string[];
    if (!shallowEqualData<string[]>(aDisabled, bDisabled)) return false;
    if (!shallowEqualData<Meeting['voiceSettings']>(aData.voiceSettings, bData.voiceSettings)) return false;
    if (!shallowEqualData<Meeting['breakoutRoomsCommonProperties']>(aData.breakoutRoomsCommonProperties, bData.breakoutRoomsCommonProperties)) return false;
    if (!shallowEqualData<Meeting['externalVideo']>(aData.externalVideo, bData.externalVideo)) return false;
    if (!shallowEqualData<Meeting['layout']>(aData.layout, bData.layout)) return false;
    if (!shallowEqualData<Meeting['componentsFlags']>(aData.componentsFlags, bData.componentsFlags)) return false;
    if ((aData.endWhenNoModerator ?? false) !== (bData.endWhenNoModerator ?? false)) return false;
    if ((aData.endWhenNoModeratorDelayInMinutes ?? 0) !== (bData.endWhenNoModeratorDelayInMinutes ?? 0)) return false;
    if ((aData.loginUrl ?? null) !== (bData.loginUrl ?? null)) return false;
    if (!shallowEqualData<Meeting['groups']>(aData.groups as Meeting['groups'], bData.groups as Meeting['groups'])) return false;

    // Policies and lock settings (top-level objects)
    if (!shallowEqualData<Meeting['lockSettings']>(aData.lockSettings, bData.lockSettings)) return false;
    if (!shallowEqualData<Meeting['usersPolicies']>(aData.usersPolicies, bData.usersPolicies)) return false;
    if (!shallowEqualData<Meeting['breakoutPolicies']>(aData.breakoutPolicies, bData.breakoutPolicies)) return false;

    return true;
  };

  return useStableResponse<T>(combined as GraphqlDataHookSubscriptionResponse<T>, meetingComparator);
}

export default useMeeting;
