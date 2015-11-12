package org.bigbluebutton.modules.phone.events
{
	import flash.events.Event;
	
	public class WebRTCCallEvent extends Event
	{
		public static const WEBRTC_CALL_STARTED:String = "WEBRTC_CALL_STARTED";
		public static const WEBRTC_CALL_CONNECTING:String = "WEBRTC_CALL_CONNECTING";
		public static const WEBRTC_CALL_ENDED:String = "WEBRTC_CALL_ENDED";
		public static const WEBRTC_CALL_FAILED:String = "WEBRTC_CALL_FAILED";
		public static const WEBRTC_CALL_WAITING_FOR_ICE:String = "WEBRTC_CALL_WAITING_FOR_ICE";
		
		public var errorCode:Number;
		public var cause:String;
		
		public function WebRTCCallEvent(type:String, errorCode:Number=0, cause:String=null, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
			
			this.errorCode = errorCode;
			this.cause = cause;
		}
	}
}