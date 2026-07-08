import loadScript from 'load-script';

// Util function to load an external SDK or return the SDK if it is already loaded
// From https://github.com/CookPete/react-player/blob/master/src/utils.js
const resolves = {};
const rejects = {};
export function getSDK(url, sdkGlobal, sdkReady = null, isLoaded = () => true,
  fetchScript = loadScript) {
  if (window[sdkGlobal] && isLoaded(window[sdkGlobal])) {
    return Promise.resolve(window[sdkGlobal]);
  }
  return new Promise((resolve, reject) => {
    // If we are already loading the SDK, add the resolve/reject
    // functions to the existing arrays of pending handlers
    if (resolves[url]) {
      resolves[url].push(resolve);
      rejects[url].push(reject);
      return;
    }
    resolves[url] = [resolve];
    rejects[url] = [reject];
    const flushQueues = () => {
      const pending = { resolves: resolves[url] || [], rejects: rejects[url] || [] };
      delete resolves[url];
      delete rejects[url];
      return pending;
    };
    const onLoaded = (sdk) => {
      // When loaded, resolve all pending promises
      flushQueues().resolves.forEach((pendingResolve) => pendingResolve(sdk));
    };
    if (sdkReady) {
      const previousOnReady = window[sdkReady];
      window[sdkReady] = function onSDKReady() {
        if (previousOnReady) previousOnReady();
        onLoaded(window[sdkGlobal]);
      };
    }
    fetchScript(url, (err) => {
      if (err) {
        // Reject every pending caller and clear the queues so a later
        // getSDK call for the same url starts a fresh load (retryable)
        flushQueues().rejects.forEach((pendingReject) => pendingReject(err));
        return;
      }
      window[sdkGlobal] = url;
      if (!sdkReady) {
        onLoaded(window[sdkGlobal]);
      }
    });
  });
}

export default getSDK;
