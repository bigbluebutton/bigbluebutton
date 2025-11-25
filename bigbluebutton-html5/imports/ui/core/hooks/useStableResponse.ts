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

export interface StableResponseOptions<T, ItemType = unknown> {
  /**
   * Custom comparator function to determine if two responses are equal
   */
  compare?: (a: GraphqlDataHookSubscriptionResponse<T>, b: GraphqlDataHookSubscriptionResponse<T>) => boolean;

  /**
   * For array data: comparator to check if two individual items are equal.
   * When provided, the hook will preserve stable references for unchanged items.
   * This is useful for lists where you want to avoid re-renders of unchanged list items.
   */
  itemCompare?: (a: ItemType, b: ItemType) => boolean;

  /**
   * For array data with itemCompare: optional function to extract a unique key from each item.
   * If not provided, items will be compared by index (order-dependent).
   */
  itemKey?: (item: ItemType) => string | number;
}

/**
 * Hook to return a stable reference for a GraphQL-style response object
 * when a custom shallow comparator reports equality. By default compares
 * top-level `loading` and shallow-equals `data` keys.
 *
 * When working with arrays and itemCompare is provided, this hook will also
 * preserve stable references for individual unchanged items in the array.
 */
export default function useStableResponse<T = unknown, ItemType = unknown>(
  value: GraphqlDataHookSubscriptionResponse<T>,
  compareOrOptions?: ((
    a: GraphqlDataHookSubscriptionResponse<T>,
    b: GraphqlDataHookSubscriptionResponse<T>
  ) => boolean) | StableResponseOptions<T, ItemType>,
): GraphqlDataHookSubscriptionResponse<T> {
  const lastRef = useRef<GraphqlDataHookSubscriptionResponse<T> | null>(null);
  const lastArrayItemsRef = useRef<Map<string | number, ItemType> | null>(null);

  // Parse options
  const options = typeof compareOrOptions === 'function'
    ? { compare: compareOrOptions }
    : (compareOrOptions ?? {});

  const { compare, itemCompare, itemKey } = options;

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

  // Check if responses are equal
  if (lastRef.current && comparator(lastRef.current as GraphqlDataHookSubscriptionResponse<T>, value)) {
    return lastRef.current as GraphqlDataHookSubscriptionResponse<T>;
  }

  // For arrays with itemCompare, stabilize individual item references
  if (itemCompare && Array.isArray(value.data)) {
    const newData = value.data as ItemType[];
    const oldItemsMap = lastArrayItemsRef.current ?? new Map<string | number, ItemType>();
    const newItemsMap = new Map<string | number, ItemType>();
    const stabilizedArray: ItemType[] = [];

    for (let i = 0; i < newData.length; i += 1) {
      const newItem = newData[i] as ItemType;
      const key = itemKey ? itemKey(newItem) : i;

      // Try to find a matching old item
      const oldItem = oldItemsMap.get(key);

      if (oldItem !== undefined && itemCompare(oldItem, newItem)) {
        // Item unchanged - reuse old reference
        stabilizedArray.push(oldItem);
        newItemsMap.set(key, oldItem);
      } else {
        // Item is new or changed - use new reference
        stabilizedArray.push(newItem);
        newItemsMap.set(key, newItem);
      }
    }

    // Update refs
    lastArrayItemsRef.current = newItemsMap;
    const stabilizedValue = {
      ...value,
      data: stabilizedArray as unknown as T,
    };
    lastRef.current = stabilizedValue;
    return stabilizedValue;
  }

  // Standard path: no item-level stabilization
  lastRef.current = value;
  lastArrayItemsRef.current = null;
  return value;
}
