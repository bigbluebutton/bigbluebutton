package org.bigbluebutton.modules.viewers.view.events
{
	import flash.events.Event;

	public class ViewCameraEvent extends Event
	{
		public static const VIEW_CAMERA_EVENT:String = "VIEW_CAMERA_EVENT";
		
		public var stream:String;
		
		public function ViewCameraEvent(stream:String)
		{
			super(VIEW_CAMERA_EVENT,true);
			this.stream = stream;
		}
		
	}
}