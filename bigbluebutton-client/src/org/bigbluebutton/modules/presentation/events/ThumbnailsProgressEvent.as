package org.bigbluebutton.modules.presentation.events
{
	import flash.events.Event;

	public class ThumbnailsProgressEvent extends Event
	{
		public static const THUMBNAILS_PROGRESS_EVENT:String = "THUMBNAILS_PROGRESS_EVENT";
		
		public function ThumbnailsProgressEvent(bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(THUMBNAILS_PROGRESS_EVENT, bubbles, cancelable);
		}
		
	}
}