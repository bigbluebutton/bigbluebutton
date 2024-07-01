export function throttle(func, delay, options = {}) {
  let timeoutId;
  let lastExecTime = 0;
  let leadingExec = true;

  const { leading = true, trailing = true } = options;

  let cancelPendingExecution = false; // Flag to track cancellation

  const throttledFunction = function () {
    const context = this;
    const args = arguments;
    const elapsed = Date.now() - lastExecTime;

    function execute() {
      if (!cancelPendingExecution) { // Only execute if not cancelled
        func.apply(context, args);
        lastExecTime = Date.now();
      }
    }

    if (leadingExec && leading) {
      execute();
      leadingExec = false;
      const nextExecDelay = elapsed < delay ? delay - elapsed : delay;
      setTimeout(function () {
        leadingExec = true;
      }, nextExecDelay);
    } else if (!timeoutId && trailing) {
      timeoutId = setTimeout(function () {
        execute();
        timeoutId = null;
      }, delay - elapsed);
    }
  };

  // Add a cancel method to the throttled function
  throttledFunction.cancel = function () {
    cancelPendingExecution = true;
    clearTimeout(timeoutId);
    timeoutId = null;
  };

  return throttledFunction;
}
