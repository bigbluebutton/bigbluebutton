/**
 * @typedef {((...args: any[]) => void) & { cancel: () => void }} DebouncedFunction
 */

/**
 * Debounce function, includes leading and trailing options (lodash-like)
 * @param {Function} func - function to be debounced
 * @param {Number} delay - delay in milliseconds
 * @param {Object} options - options object
 * @param {Boolean} options.leading - whether to invoke the function on the leading edge
 * @param {Boolean} options.trailing - whether to invoke the function on the trailing edge
 * @returns {DebouncedFunction} - debounced function; cancel() drops a pending trailing call
 */
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

  function scheduleTimeout() {
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
  }

  function debounced(...args) {
    lastArgs = args;
    lastThis = this;

    if (!timeoutId) {
      if (leading && !calledOnce) {
        invokeFunc();
        calledOnce = true;
      }

      scheduleTimeout();
    } else if (trailing) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        invokeFunc();
        timeoutId = null;
      }, delay);
    } else if (leading && calledOnce) {
      clearTimeout(timeoutId);
      scheduleTimeout();
    }
  }

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
    lastThis = null;
    calledOnce = false;
  };

  return debounced;
}
