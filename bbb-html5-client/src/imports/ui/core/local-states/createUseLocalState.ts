import { ReactiveVar, makeVar, useReactiveVar } from '@apollo/client';

function createUseLocalState<T>(initialValue: T):
[
  () => [T, (value: T) => void], // hook that returns [state, setter]
  (value: T | ((curr: T) => T)) => void, // setter
  ReactiveVar<T> // state
] {
  const localState = makeVar(initialValue);

  function useLocalState(): [T, (value: T) => void] {
    const reactiveLocalState = useReactiveVar(localState);
    return [reactiveLocalState, changeLocalState];
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  function changeLocalState(value: T | ((curr: T) => T)) {
    if (value instanceof Function) {
      return localState(value(localState()));
    }
    return localState(value);
  }

  return [useLocalState, changeLocalState, localState];
}

export default createUseLocalState;
