package org.bigbluebutton.air.util
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
			
			private static function generateRandomString(strlen:Number):String{
				var chars:String = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
				var num_chars:Number = chars.length - 1;
				var randomChar:String = "";
				
				for (var i:Number = 0; i < strlen; i++){
					randomChar += chars.charAt(Math.floor(Math.random() * num_chars));
				}
				return randomChar;
			}
			
			public static function generateConnId():String {
				return generateRandomString(15);
			}
	}
}