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
  const keyVars = new Map<string, ReturnType<typeof makeVar<boolean | undefined>>>();
  const keyRefCounts = new Map<string, number>();
  const dummyKeyVar = makeVar<boolean | undefined>(undefined);
  const dummyFullStateVar = makeVar<Record<string, boolean>>({});

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
      if (!(stateKey in newState) && keyVar() !== undefined) {
        keyVar(undefined);

        // Only delete if no components are currently listening to this key
        if (!keyRefCounts.has(stateKey) || keyRefCounts.get(stateKey) === 0) {
          keyVars.delete(stateKey);
        }
      }
    });
  };

  function useData(): FullStateDataResult;
  function useData(key: string): PerKeyDataResult;
  function useData(key?: string): FullStateDataResult | PerKeyDataResult {
    const loading = baseHook.useLoading();
    const fullStateResult = key
      ? useReactiveVar(dummyFullStateVar)
      : baseHook.useData().data;

    useEffect(() => {
      if (!key) return () => {};

      const currentCount = keyRefCounts.get(key) || 0;
      keyRefCounts.set(key, currentCount + 1);

      return () => {
        const newCount = (keyRefCounts.get(key) || 0) - 1;

        if (newCount <= 0) {
          // If key is not in the current state, we can safely cleanup the var
          const currentState = baseHook.getState();
          if (currentState[key] == null) keyVars.delete(key);
          keyRefCounts.delete(key);
        } else {
          keyRefCounts.set(key, newCount);
        }
      };
    }, [key]);

    const keySpecificVar = useMemo(() => {
      if (!key) return dummyKeyVar;

      let keyVar = keyVars.get(key);

      if (!keyVar) {
        const currentState = baseHook.getState();
        const initialValue = currentState[key];
        keyVar = makeVar<boolean | undefined>(initialValue);
        keyVars.set(key, keyVar);
      }

      return keyVar;
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
