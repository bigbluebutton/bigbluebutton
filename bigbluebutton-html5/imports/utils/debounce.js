/**
 * Debounce function, includes leading and trailing options (lodash-like)
 * @param {Function} func - function to be debounced
 * @param {Number} delay - delay in milliseconds
 * @param {Object} options - options object
 * @param {Boolean} options.leading - whether to invoke the function on the leading edge
 * @param {Boolean} options.trailing - whether to invoke the function on the trailing edge
 * @returns {Function} - debounced function
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
