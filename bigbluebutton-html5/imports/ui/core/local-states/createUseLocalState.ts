import { ReactiveVar, makeVar, useReactiveVar } from '@apollo/client';

function createUseLocalState<T>(initialValue: T):
[
  () => [T, (value: T) => void], // hook that returns [state, setter]
  (value: T) => void, // setter
  ReactiveVar<T> // state
] {
  const localState = makeVar(initialValue);

  function useLocalState(): [T, (value: T) => void] {
    const reactiveLocalState = useReactiveVar(localState);
    return [reactiveLocalState, changeLocalState];
  }

  function changeLocalState(value: T | Function) {
    if (value instanceof Function) {
      return localState(value(localState()));
    }
    return localState(value);
  }

  return [useLocalState, changeLocalState, localState];
}

export default createUseLocalState;
