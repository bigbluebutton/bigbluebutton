import { makeVar, useReactiveVar } from '@apollo/client';

function createUseLocalState<T>(initialValue: T) {
  const localState = makeVar(initialValue);

  function useLocalState(): [T, (value: T) => void] {
    const reactiveLocalState = useReactiveVar(localState);
    return [reactiveLocalState, changeLocalState];
  }

  function changeLocalState(value: T | Function) {
    if (typeof value === 'function') {
      return localState(value(localState()));
    }
    return localState(value);
  }

  return [useLocalState, changeLocalState, localState];
}

export default createUseLocalState;
