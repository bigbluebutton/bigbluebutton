package org.bigbluebutton.modules.videoconf.events
{
	import flash.events.Event;
	
	public class WebRTCWebcamRequestEvent extends Event
	{
		public static const WEBRTC_WEBCAM_REQUEST:String = "WEBRTC_WEBCAM_REQUEST";
		public static const WEBRTC_WEBCAM_SUCCESS:String = "WEBRTC_WEBCAM_SUCCESS";
		public static const WEBRTC_WEBCAM_FAIL:String = "WEBRTC_WEBCAM_FAIL";
		
		public var cause:String;
		
		public function WebRTCWebcamRequestEvent(type:String, cause:String=null, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
			this.cause = cause;
		}
	}
}