function getSourceId(sender, callback) {
  var presetSources = ["screen", "window"];
  var sourcesToUse = sender.sources || presetSources;
  var tab = sender.tab;

  // https://bugs.chromium.org/p/chromium/issues/detail?id=425344
  tab.url = sender.url;
  
  // Gets chrome media stream token and returns it in the response.
  chrome.desktopCapture.chooseDesktopMedia(
    sourcesToUse, tab,
    function (streamId) {
      if (!streamId || !streamId.length) {
        callback({ error: 'permissionDenied' });
        return;
      }

      callback({ streamId: streamId });
    });

  return true;
}

chrome.runtime.onMessageExternal.addListener(
  function(request, sender, callback) {
    if(request.getVersion) {
      callback({ version: chrome.runtime.getManifest().version });
      return false;
    } else if(request.getStream) {
      getSourceId(sender, callback);
      return true;
    } else {
      callback({ error: 'malformed request', request });
      return false;
    }
  }
);
