import { useEffect } from 'react';
import { makeVar, useReactiveVar } from '@apollo/client';
import { isEqual } from 'radash';

type ReactiveStateHookResult<T> = {
  useData: () => { data: T; loading: boolean };

  useLoading: () => boolean;

  useConsumersCount: () => number;

  setLoading: (loading: boolean) => void;

  dispatch: (newState: T) => void;

  getState: () => T;

  setState: (newState: T) => void;
};

/**
 * Creates a reactive state hook with consumer counting and automatic cleanup.
 *
 * @template T - The type of the state data
 * @param initialState - The initial state value
 * @returns An object containing the hook and utility functions
 *
 */
const createReactiveStateHook = <T>(initialState: T): ReactiveStateHookResult<T> => {
  const countVar = makeVar(0);
  const stateVar = makeVar<T>(initialState);
  const loadingVar = makeVar(true);

  const getState = () => stateVar();

  const setState = (newState: T) => stateVar(newState);

  const setLoading = (loading: boolean) => loadingVar(loading);

  const dispatch = (newState: T) => {
    if (countVar() === 0) return;

    if (!isEqual(getState(), newState)) {
      stateVar(newState);
    }
  };

  const useConsumersCount = () => useReactiveVar(countVar);

  const useLoading = () => useReactiveVar(loadingVar);

  const useData = () => {
    const state = useReactiveVar(stateVar);
    const loading = useReactiveVar(loadingVar);

    useEffect(() => {
      countVar(countVar() + 1);

      return () => {
        countVar(countVar() - 1);

        if (countVar() === 0) stateVar(initialState);
      };
    }, []);

    return { data: state, loading };
  };

  return {
    useData,
    useLoading,
    useConsumersCount,
    setLoading,
    dispatch,
    getState,
    setState,
  };
};

export default createReactiveStateHook;
export type { ReactiveStateHookResult };
