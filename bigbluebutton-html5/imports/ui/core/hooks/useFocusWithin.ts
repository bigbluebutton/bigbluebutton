import { useEffect, useRef } from 'react';

export const isFocusLost = (): boolean => (
  !document.activeElement || document.activeElement === document.body
);

// Whether the focus is in the element. Removing the focused element drops the focus to the body
// without a focus change of the user's, so the flag stays set until the focus goes elsewhere.
export const useFocusWithin = (getElement: () => Element | null | undefined) => {
  const focusWithinRef = useRef(false);

  useEffect(() => {
    const handleFocusIn = (event: FocusEvent) => {
      focusWithinRef.current = !!getElement()?.contains(event.target as Node);
    };
    const handleFocusOut = (event: FocusEvent) => {
      const target = event.target as Node;
      // A focus moving to another element is handled by its focusin.
      if (event.relatedTarget || !getElement()?.contains(target)) return;
      // Chrome also blurs an element as it is removed, so only a blur that leaves the element in
      // place means the focus went elsewhere.
      queueMicrotask(() => {
        if (target.isConnected) focusWithinRef.current = false;
      });
    };
    document.addEventListener('focusin', handleFocusIn, true);
    document.addEventListener('focusout', handleFocusOut, true);
    return () => {
      document.removeEventListener('focusin', handleFocusIn, true);
      document.removeEventListener('focusout', handleFocusOut, true);
    };
  }, [getElement]);

  return focusWithinRef;
};

export default useFocusWithin;
