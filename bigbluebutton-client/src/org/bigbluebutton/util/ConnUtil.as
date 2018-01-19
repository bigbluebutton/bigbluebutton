package org.bigbluebutton.util
{
	public class ConnUtil
	{
			public static const RTMPS: String = "rtmps";
			public static const RTMPT: String = "rtmpt";
			public static const RTMP: String = "rtmp";
			public static const PROXY_NONE: String = "none";
			public static const PROXY_BEST: String = "best";
			
			
			public static function parseRTMPConn(appURL: String):Array {
				var pattern:RegExp = /(?P<protocol>.+):\/\/(?P<server>.+)\/(?P<app>.+)/;
				var result:Array = pattern.exec(appURL);
				return result;
			}
	}
}