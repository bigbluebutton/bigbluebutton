import { useEffect, useMemo } from 'react';
import { makeVar, useReactiveVar } from '@apollo/client';
import createReactiveStateHook from './createReactiveStateHook';

type PerKeyDataResult = {
  data: boolean | undefined;
  loading: boolean;
};

type FullStateDataResult = {
  data: Record<string, boolean>;
  loading: boolean;
};

type UseDataHook = {
  (): FullStateDataResult;
  (key: string): PerKeyDataResult;
};

type ReactiveRecordStateHookResult = {
  useData: UseDataHook;

  useLoading: () => boolean;

  useConsumersCount: () => number;

  setLoading: (loading: boolean) => void;

  getState: () => Record<string, boolean>;

  setState: (newState: Record<string, boolean>) => void;
};

/**
 * Creates a reactive state hook for a Record<string, boolean> state object
 * with per-key granular subscription support.
 *
 * @returns An object containing the hook and utility functions
 */
const createReactiveRecordStateHook = (): ReactiveRecordStateHookResult => {
  const baseHook = createReactiveStateHook<Record<string, boolean>>({});
  // Key vars are created once and never removed: the var a render reads must be
  // the same object a later update writes to, whatever the mount/unmount order.
  const keyVars = new Map<string, ReturnType<typeof makeVar<boolean | undefined>>>();
  const dummyKeyVar = makeVar<boolean | undefined>(undefined);
  const dummyFullStateVar = makeVar<Record<string, boolean>>({});

  const getKeyVar = (key: string) => {
    let keyVar = keyVars.get(key);

    if (!keyVar) {
      keyVar = makeVar<boolean | undefined>(baseHook.getState()[key]);
      keyVars.set(key, keyVar);
    }

    return keyVar;
  };

  const setState = (newState: Record<string, boolean>) => {
    const currentState = baseHook.getState();

    baseHook.dispatch(newState);

    if (baseHook.getState() === currentState) return;

    Object.keys(newState).forEach((stateKey) => {
      let keyVar = keyVars.get(stateKey);

      if (!keyVar) {
        keyVar = makeVar<boolean | undefined>(newState[stateKey]);
        keyVars.set(stateKey, keyVar);
      } else if (keyVar() !== newState[stateKey]) {
        keyVar(newState[stateKey]);
      }
    });

    // Clear keys no longer in the state
    keyVars.forEach((keyVar, stateKey) => {
      if (stateKey in newState) return;

      if (keyVar() !== undefined) keyVar(undefined);
    });
  };

  function useData(): FullStateDataResult;
  function useData(key: string): PerKeyDataResult;
  function useData(key?: string): FullStateDataResult | PerKeyDataResult {
    const loading = baseHook.useLoading();
    // Per-key consumers count as consumers of the underlying state as well:
    // dispatches are dropped and the source subscriptions skipped when the
    // consumer count is zero.
    baseHook.useConsumer();
    // Both vars are always subscribed to - the unused one being a dummy that
    // never changes - so that the hook call order is stable regardless of
    // whether a key was supplied.
    const fullStateResult = useReactiveVar(
      key === undefined ? baseHook.stateVar : dummyFullStateVar,
    );

    useEffect(() => {
      if (key === undefined) return;

      // The var may predate the last full-state reset, which does not go
      // through setState and so leaves key vars untouched.
      const keyVar = getKeyVar(key);
      const currentValue = baseHook.getState()[key];

      if (keyVar() !== currentValue) keyVar(currentValue);
    }, [key]);

    const keySpecificVar = useMemo(() => {
      if (key === undefined) return dummyKeyVar;

      return getKeyVar(key);
    }, [key]);

    const data = useReactiveVar(keySpecificVar);

    if (key !== undefined) return { data, loading };

    return { data: fullStateResult, loading };
  }

  return {
    useData: useData as UseDataHook,
    useLoading: baseHook.useLoading,
    useConsumersCount: baseHook.useConsumersCount,
    setLoading: baseHook.setLoading,
    getState: baseHook.getState,
    setState,
  };
};

export default createReactiveRecordStateHook;
export type { ReactiveRecordStateHookResult, PerKeyDataResult, FullStateDataResult };
