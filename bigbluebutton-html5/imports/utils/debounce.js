export function debounce(func, delay, options = {}) {
  let timeoutId;
  let lastArgs;
  let lastThis;
  let calledOnce = false;

  const { leading = false, trailing = true } = options;

  function invokeFunc() {
    func.apply(lastThis, lastArgs);
    lastArgs = null;
    lastThis = null;
  }

  return function (...args) {
    lastArgs = args;
    lastThis = this;

    if (!timeoutId) {
      if (leading && !calledOnce) {
        invokeFunc();
        calledOnce = true;
      }

      timeoutId = setTimeout(() => {
        if (!trailing) {
          clearTimeout(timeoutId);
          timeoutId = null;
        } else {
          invokeFunc();
          timeoutId = null;
        }
        calledOnce = false;
      }, delay);
    } else if (trailing) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        invokeFunc();
        timeoutId = null;
      }, delay);
    }
  };
}
