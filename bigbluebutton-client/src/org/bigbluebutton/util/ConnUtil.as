package org.bigbluebutton.util
{
	import com.asfusion.mate.events.Dispatcher;
	
	import org.bigbluebutton.main.events.BBBEvent;
	import org.bigbluebutton.main.events.ClientStatusEvent;
	import org.bigbluebutton.util.i18n.ResourceUtil;

	public class ConnUtil
	{
		
		public static const BIGBLUEBUTTON_CONNECTION:String = "BIGBLUEBUTTON_CONNECTION";
		public static const SIP_CONNECTION:String = "SIP_CONNECTION";
		public static const VIDEO_CONNECTION:String = "VIDEO_CONNECTION";
		public static const DESKSHARE_CONNECTION:String = "DESKSHARE_CONNECTION";
		
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
				//var chars:String = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
				var chars:String = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
				var num_chars:Number = chars.length - 1;
				var randomChar:String = "";
				
				for (var i:Number = 0; i < strlen; i++){
					randomChar += chars.charAt(Math.floor(Math.random() * num_chars));
				}
				return randomChar;
			}
			
			public static function generateConnId():String {
				return generateRandomString(16);
			}
			
			public static function dispatchReconnectionSucceededEvent(type:String):void {
				var map:Object = {
					BIGBLUEBUTTON_CONNECTION: BBBEvent.RECONNECT_BIGBLUEBUTTON_SUCCEEDED_EVENT,
						SIP_CONNECTION: BBBEvent.RECONNECT_SIP_SUCCEEDED_EVENT,
						VIDEO_CONNECTION: BBBEvent.RECONNECT_VIDEO_SUCCEEDED_EVENT,
						DESKSHARE_CONNECTION: BBBEvent.RECONNECT_DESKSHARE_SUCCEEDED_EVENT
				};
				
				if (map.hasOwnProperty(type)) {
					var _dispatcher:Dispatcher = new Dispatcher();
					_dispatcher.dispatchEvent(new BBBEvent(map[type]));
				}
			}
			
			public static function connectionSuccessEvent(msg: String):void {
				var _dispatcher:Dispatcher = new Dispatcher();
				_dispatcher.dispatchEvent(new ClientStatusEvent(ClientStatusEvent.SUCCESS_MESSAGE_EVENT, 
					ResourceUtil.getInstance().getString('bbb.connection.reestablished'), 
					msg, 'bbb.connection.reestablished'));
			}
			
			public static function connectionReestablishedMsg(conn:String):String {
				switch (conn) {
					case ConnUtil.BIGBLUEBUTTON_CONNECTION:
						return ResourceUtil.getInstance().getString('bbb.connection.bigbluebutton');
					case ConnUtil.SIP_CONNECTION:
						return ResourceUtil.getInstance().getString('bbb.connection.sip');
					case ConnUtil.VIDEO_CONNECTION:
						return ResourceUtil.getInstance().getString('bbb.connection.video');
					case ConnUtil.DESKSHARE_CONNECTION:
						return ResourceUtil.getInstance().getString('bbb.connection.deskshare');
					default:
						return "";
				}
			}
			
	}
}