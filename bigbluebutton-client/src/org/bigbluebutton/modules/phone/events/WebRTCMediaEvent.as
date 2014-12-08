package org.bigbluebutton.modules.phone.events
{
	import flash.events.Event;
	
	public class WebRTCMediaEvent extends Event
	{
		public static const WEBRTC_MEDIA_REQUEST:String = "WEBRTC_MEDIA_REQUEST";
		public static const WEBRTC_MEDIA_SUCCESS:String = "WEBRTC_MEDIA_SUCCESS";
		public static const WEBRTC_MEDIA_FAIL:String = "WEBRTC_MEDIA_FAIL";
		
		public function WebRTCMediaEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
	}
}