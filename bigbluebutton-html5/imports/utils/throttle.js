export function throttle(func, delay, options = {}) {
  let timeoutId;
  let lastExecTime = 0;
  let leadingExec = true;

  const { leading = true, trailing = true } = options;

  return function () {
    const context = this;
    const args = arguments;
    const elapsed = Date.now() - lastExecTime;

    function execute() {
      func.apply(context, args);
      lastExecTime = Date.now();
    }

    if (leadingExec && leading) {
      execute();
      leadingExec = false;
    } else if (!timeoutId && trailing) {
      timeoutId = setTimeout(function () {
        execute();
        timeoutId = null;
      }, delay - elapsed);
    }
  }
}
