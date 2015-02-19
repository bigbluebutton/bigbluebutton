package org.bigbluebutton.modules.phone.events
{
	import flash.events.Event;
	
	public class WebRTCEchoTestEvent extends Event
	{
		public static const WEBRTC_ECHO_TEST_STARTED:String = "WEBRTC_ECHO_TEST_STARTED";
		public static const WEBRTC_ECHO_TEST_CONNECTING:String = "WEBRTC_ECHO_TEST_CONNECTING";
		public static const WEBRTC_ECHO_TEST_ENDED:String = "WEBRTC_ECHO_TEST_ENDED";
		public static const WEBRTC_ECHO_TEST_FAILED:String = "WEBRTC_ECHO_TEST_FAILED";
		public static const WEBRTC_ECHO_TEST_HAS_AUDIO:String = "WEBRTC_ECHO_TEST_HAS_AUDIO";
		public static const WEBRTC_ECHO_TEST_NO_AUDIO:String = "WEBRTC_ECHO_TEST_NO_AUDIO";
		public static const WEBRTC_ECHO_TEST_ENDED_UNEXPECTEDLY:String = "WEBRTC_ECHO_TEST_ENDED_UNEXPECTEDLY";
		public static const WEBRTC_ECHO_TEST_WAITING_FOR_ICE:String = "WEBRTC_ECHO_TEST_WAITING_FOR_ICE";
		public static const WEBRTC_ECHO_TEST_TRANSFERRING:String = "WEBRTC_ECHO_TEST_TRANSFERRING";
		
		public var errorCode:Number;
		public var cause:String;
		
		public function WebRTCEchoTestEvent(type:String, errorCode:Number=0, cause:String=null, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
			
			this.errorCode = errorCode;
			this.cause = cause;
		}
	}
}