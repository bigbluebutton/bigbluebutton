import {
  useCallback, useLayoutEffect, useRef, useState,
} from 'react';

export interface ElementSize {
  width: number;
  height: number;
}

const readSize = (element: Element): ElementSize => {
  const { width, height } = element.getBoundingClientRect();
  return { width, height };
};

const sameSize = (a: ElementSize | null, b: ElementSize | null) => (
  a === b || (!!a && !!b && a.width === b.width && a.height === b.height)
);

/**
 * The border-box size of an element, for components that need numbers about their own box (the
 * whiteboard fit, the camera grid). Returns a callback ref to attach to the element and its size:
 * null until the element is attached, measured synchronously when it attaches (so the first paint
 * already has it), then kept current by a ResizeObserver, at most once per animation frame.
 */
export default function useElementSize<T extends Element>(): [(element: T | null) => void, ElementSize | null] {
  const [element, setElement] = useState<T | null>(null);
  const [size, setSize] = useState<ElementSize | null>(null);
  const sizeRef = useRef<ElementSize | null>(null);

  const publish = useCallback((next: ElementSize | null) => {
    if (sameSize(sizeRef.current, next)) return;
    sizeRef.current = next;
    setSize(next);
  }, []);

  useLayoutEffect(() => {
    if (!element) {
      publish(null);
      return undefined;
    }
    publish(readSize(element));
    let frame: number | null = null;
    const observer = new ResizeObserver(() => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        publish(readSize(element));
      });
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [element, publish]);

  return [setElement, size];
}
