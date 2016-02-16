package org.bigbluebutton.modules.deskshare.utils
{
  import flash.external.ExternalInterface;
  import org.bigbluebutton.core.BBB;
	import flash.system.Capabilities;
	import org.as3commons.logging.api.getClassLogger;
	import org.as3commons.logging.api.ILogger;

  public class BrowserCheck {
		private static const LOGGER:ILogger = getClassLogger(BrowserCheck);

    public static function isChrome42OrHigher():Boolean {
      var browser:Array = ExternalInterface.call("determineBrowser");
      return ((browser[0] == "Chrome") && (parseInt(browser[1]) >= 42));
    }

    public static function isUsingLessThanChrome38OnMac():Boolean {
      var browser:Array = ExternalInterface.call("determineBrowser");
      return ((browser[0] == "Chrome") && (parseInt(browser[1]) <= 38) && (Capabilities.os.indexOf("Mac") >= 0));
    }

    public static function isWebRTCSupported():Boolean {
      LOGGER.debug("isWebRTCSupported - ExternalInterface.available=[{0}], isWebRTCAvailable=[{1}]", [ExternalInterface.available, ExternalInterface.call("isWebRTCAvailable")]);
      return (ExternalInterface.available && ExternalInterface.call("isWebRTCAvailable"));
    }

    public static function isChrome():Boolean {
      var browser:Array = ExternalInterface.call("determineBrowser");
      return browser[0] == "Chrome";
    }

    public static function isFirefox():Boolean {
      var browser:Array = ExternalInterface.call("determineBrowser");
      return browser[0] == "Firefox";
    }    
	}
}
