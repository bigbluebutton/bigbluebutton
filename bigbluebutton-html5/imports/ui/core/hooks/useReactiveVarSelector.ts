import { useCallback, useSyncExternalStore } from 'react';
import { ReactiveVar } from '@apollo/client';

// Unlike useReactiveVar, re-renders only when the selected value changes, so the
// selector must return a primitive or an otherwise stable reference.
const useReactiveVarSelector = <T, S>(
  reactiveVar: ReactiveVar<T>,
  selector: (value: T) => S,
): S => {
  const subscribe = useCallback((onChange: () => void) => {
    // onNextChange fires only once, so each change re-arms it.
    let unsubscribe = reactiveVar.onNextChange(function handleChange() {
      unsubscribe = reactiveVar.onNextChange(handleChange);
      onChange();
    });
    return () => unsubscribe();
  }, [reactiveVar]);

  return useSyncExternalStore(subscribe, () => selector(reactiveVar()));
};

export default useReactiveVarSelector;
