import { useRef } from 'react';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';

/**
 * Pre-compare GraphQL-style responses for common early-exit checks.
 * Returns:
 *  - true  => responses are equal
 *  - false => responses are definitively different
 *  - { aData, bData } => need content-level comparison; both data are non-null
 */
export function precompareResponses<T>(
  a: GraphqlDataHookSubscriptionResponse<T> | null,
  b: GraphqlDataHookSubscriptionResponse<T>,
): true | false | { aData: T | null | undefined, bData: T | null | undefined } {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.loading !== b.loading) return false;

  const aData = a.data as T | null | undefined;
  const bData = b.data as T | null | undefined;
  if (!aData && !bData) return true;
  if (!aData || !bData) return false;
  return { aData, bData };
}

/**
 * Hook to return a stable reference for a GraphQL-style response object
 * when a custom shallow comparator reports equality. By default compares
 * top-level `loading` and shallow-equals `data` keys.
 */
export default function useStableResponse<T = unknown>(
  value: GraphqlDataHookSubscriptionResponse<T>,
  compare?: (a: GraphqlDataHookSubscriptionResponse<T>, b: GraphqlDataHookSubscriptionResponse<T>) => boolean,
): GraphqlDataHookSubscriptionResponse<T> {
  const lastRef = useRef<GraphqlDataHookSubscriptionResponse<T> | null>(null);

  function shallowEqualObjects(aObj: Record<string, unknown>, bObj: Record<string, unknown>) {
    const aKeys = Object.keys(aObj);
    const bKeys = Object.keys(bObj);
    if (aKeys.length !== bKeys.length) return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aAny = aObj as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bAny = bObj as any;
    for (let i = 0; i < aKeys.length; i += 1) {
      const k = aKeys[i];
      if (aAny[k] !== bAny[k]) return false;
    }
    return true;
  }

  /**
   * Default shallow comparator
   * --------------------------
   * This comparator is a generic, shallow structural equality check for
   * GraphQL-style responses. It compares the `loading` flag and then
   * performs a shallow comparison of `data`.
   */
  function defaultShallowCompare(a: GraphqlDataHookSubscriptionResponse<T>, b: GraphqlDataHookSubscriptionResponse<T>) {
    const pre = precompareResponses<T>(a, b);
    if (pre === true) return true;
    if (pre === false) return false;

    const { aData: aRaw, bData: bRaw } = pre;
    const aData = aRaw as unknown;
    const bData = bRaw as unknown;

    // arrays: shallow-compare elements (if objects, shallow compare their keys)
    if (Array.isArray(aData) && Array.isArray(bData)) {
      if (aData.length !== bData.length) return false;
      for (let i = 0; i < aData.length; i += 1) {
        const ai = aData[i];
        const bi = bData[i];
        if (ai === bi) {
          // exact same reference or primitive equal
        } else if (typeof ai === 'object' && ai && typeof bi === 'object' && bi) {
          if (!shallowEqualObjects(ai as Record<string, unknown>, bi as Record<string, unknown>)) return false;
        } else if (ai !== bi) {
          return false;
        }
      }
      return true;
    }

    // objects: shallow-compare top-level keys
    if (typeof aData === 'object' && aData && typeof bData === 'object' && bData) {
      return shallowEqualObjects(aData as Record<string, unknown>, bData as Record<string, unknown>);
    }

    // fallback to strict equality
    return aData === bData;
  }

  const comparator = compare ?? defaultShallowCompare;

  if (lastRef.current && comparator(lastRef.current as GraphqlDataHookSubscriptionResponse<T>, value)) {
    return lastRef.current as GraphqlDataHookSubscriptionResponse<T>;
  }
  lastRef.current = value;
  return value;
}
