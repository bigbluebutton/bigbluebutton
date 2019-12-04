/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2017 BigBlueButton Inc. and by respective authors (see below).
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

package org.bigbluebutton.modules.screenshare.utils
{
  import flash.external.ExternalInterface;
  import flash.system.Capabilities;
  
  import org.as3commons.lang.StringUtils;
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.Options;
  import org.bigbluebutton.modules.screenshare.model.ScreenshareOptions;
  import org.bigbluebutton.util.browser.BrowserCheck;

  public class WebRTCScreenshareUtility {
    private static const LOGGER:ILogger = getClassLogger(WebRTCScreenshareUtility);
    public static var chromeExtensionKey:String = null;
    public static var extensionLink:String = null;
    private static var options:ScreenshareOptions = null;

    public static function canIUseWebRTCOnThisBrowser (cannotUseWebRTC:Function, webRTCWorksButNotConfigured:Function, webRTCWorksAndConfigured:Function):void {
      LOGGER.debug("WebRTCScreenshareUtility::canIUseWebRTCOnThisBrowser");

      if (!ExternalInterface.available) {
        cannotUseWebRTC("No ExternalInterface");
        return;
      }

      // https is required for webrtc and for peripheral sharing
      if (!BrowserCheck.isHttps()) {
        cannotUseWebRTC("WebRTC Screensharing requires an HTTPS connection");
        return;
      }

      if (options == null) {
        options = Options.getOptions(ScreenshareOptions) as ScreenshareOptions;
      }

      // fail if you dont want to try webrtc first
      if (!options.offerWebRTC) {
        cannotUseWebRTC("WebRTC Screensharing is not disabled in configuration");
        return;
      }

      // webrtc isnt even supported
      if (!BrowserCheck.isWebRTCSupported()) {
        cannotUseWebRTC("Web browser does not support WebRTC");
        return;
	  }

      // if its firefox go ahead and let webrtc handle it
      if (BrowserCheck.isFirefox()) {
        if (Capabilities.os.indexOf("Mac") >= 0) {
          cannotUseWebRTC("Firefox on Mac performs poorly fallback to Java");
        } else {
          webRTCWorksAndConfigured("Firefox, lets try");
        }
        return;

      // if its chrome we need to check for the extension
      } else if (BrowserCheck.isChrome()) {
        // We only need to check for the extension for Chrome versions before 72
        if (BrowserCheck.browserMajorVersion < '72') {
          WebRTCScreenshareUtility.extensionLink = options.chromeExtensionLink;
        
          // if theres no extension link-- users cant download-- fail
          if (StringUtils.isEmpty(options.chromeExtensionLink) || StringUtils.equalsIgnoreCase(options.chromeExtensionLink, "LINK")) {
            cannotUseWebRTC("No extensionLink in config.xml");
            return;
          }
        
          WebRTCScreenshareUtility.chromeExtensionKey = options.chromeExtensionKey;

          // if theres no key we cannot connect to the extension-- fail
          if (StringUtils.isEmpty(WebRTCScreenshareUtility.chromeExtensionKey) || StringUtils.equalsIgnoreCase(options.chromeExtensionKey, "KEY")) {
            cannotUseWebRTC("No chromeExtensionKey in config.xml");
            return;
          }
        }

        // connect to the webrtc code to attempt a connection with the extension
        var onSuccess:Function = function(exists:Boolean):void {
          // clear the check callback
          ExternalInterface.addCallback("onSuccess", null);

          if (exists) {
            LOGGER.debug("Chrome Extension exists");
            webRTCWorksAndConfigured("worked");
          } else {
            webRTCWorksButNotConfigured("No Chrome Extension");
            LOGGER.debug("no chrome extension");
          }
        };

        // add the callback
        ExternalInterface.addCallback("onSuccess", onSuccess);
        // check if the extension exists
        ExternalInterface.call("checkChromeExtInstalled", "onSuccess", WebRTCScreenshareUtility.chromeExtensionKey);
      } else if (BrowserCheck.isEdge()) {
        webRTCWorksAndConfigured("Edge, lets try");
      } else {
        cannotUseWebRTC("Web browser doesn't support WebRTC");
        return;
      }
    }
  }
}
