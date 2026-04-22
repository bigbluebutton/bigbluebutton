import React, {
  useCallback, useMemo, useRef, useState,
} from 'react';

const CURRENT_FIELD = 'current';

const useIntersectionObserver = <P extends HTMLElement, C extends HTMLElement>(
  parentRef: React.MutableRefObject<P | null>,
  childRef: React.MutableRefObject<C | null>,
  threshold: number = 0.1,
) => {
  const observer = useRef<IntersectionObserver | null>(null);
  const [intersecting, setIntersecting] = useState(false);

  const updateIntersectionObserver = useCallback(
    (root?: HTMLElement | null) => {
      if (observer.current) {
        observer.current.disconnect();
      }
      const newObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const { isIntersecting } = entry;
          setIntersecting(isIntersecting);
        });
      }, {
        root,
        threshold,
      });
      observer.current = newObserver;
    },
    [setIntersecting],
  );

  const parentRefProxy = useMemo(
    () => new Proxy(parentRef, {
      set(target, field, newValue, receiver) {
        if (field === CURRENT_FIELD) {
          updateIntersectionObserver(newValue);
          if (childRef.current && observer.current) {
            observer.current.observe(childRef.current);
          }
        }
        return Reflect.set(target, field, newValue, receiver);
      },
    }),
    [parentRef],
  );

  const childRefProxy = useMemo(
    () => new Proxy(childRef, {
      set(target, field, newValue, receiver) {
        if (field === CURRENT_FIELD) {
          if (!observer.current) {
            updateIntersectionObserver(parentRef.current);
          } else if (childRef.current) {
            observer.current.unobserve(childRef.current);
          }
          if (newValue instanceof HTMLElement && observer.current) {
            observer.current.observe(newValue);
          }
        }
        return Reflect.set(target, field, newValue, receiver);
      },
    }),
    [childRef],
  );

  return {
    childRefProxy,
    parentRefProxy,
    intersecting,
  };
};

export default useIntersectionObserver;
