package org.bigbluebutton.modules.video.view.events
{
	import flash.events.Event;

	public class CloseViewCameraWindowEvent extends Event
	{
		public static const CLOSE_VIEW_CAMERA_WINDOW_EVENT:String = "CLOSE_VIEW_CAMERA_WINDOW_EVENT";
		public var streamName:String;
					
		public function CloseViewCameraWindowEvent(streamName:String)
		{
			super(CLOSE_VIEW_CAMERA_WINDOW_EVENT);
			this.streamName = streamName;
		}
		
	}
}