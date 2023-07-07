export function throttle(func, delay, options = {}) {
  let lastInvocation = 0;
  let isWaiting = false;
  let timeoutId;

  const leading = options.leading !== undefined ? options.leading : true;
  const trailing = options.trailing !== undefined ? options.trailing : true;

  return function throttled(...args) {
    const invokeFunction = () => {
      lastInvocation = Date.now();
      isWaiting = false;
      func.apply(this, args);
    };

    if (!isWaiting) {
      if (leading) {
        invokeFunction();
      } else {
        isWaiting = true;
      }

      const currentTime = Date.now();
      const timeSinceLastInvocation = currentTime - lastInvocation;

      if (timeSinceLastInvocation >= delay) {
        clearTimeout(timeoutId);
        invokeFunction();
      } else if (trailing) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(invokeFunction, delay - timeSinceLastInvocation);
      }
    }
  };
}