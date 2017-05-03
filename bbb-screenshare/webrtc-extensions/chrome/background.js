/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */

function getSourceId(sender, callback, request) {
  var presetSources = ["screen", "window", "tab"];
  var sourcesToUse = request.sources || presetSources;
  
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
      getSourceId(sender, callback, request);
      return true;
    } else {
      callback({ error: 'malformed request', request });
      return false;
    }
  }
);
