import React, { useEffect, useMemo, useRef } from 'react';

const useUpdate = (update: React.EffectCallback, deps?: React.DependencyList) => {
  const isFirstRender = useRef(true);
  const proxy = useMemo(() => new Proxy(update, {
    apply(target, thisArg, argArray) {
      const first = isFirstRender.current;
      if (first) isFirstRender.current = false;
      return first ? undefined : Reflect.apply(target, thisArg, argArray);
    },
  }), [update]);
  useEffect(proxy, deps);
};

export default useUpdate;
