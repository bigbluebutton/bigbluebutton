package org.bigbluebutton.modules.present.events
{
	import flash.events.Event;

	public class RemovePresentationEvent extends Event
	{
		// Tell the server to remove the presentation.
		public static const REMOVE_PRESENTATION_EVENT:String = "Remove Presentation Event";
		
		// Presentation has been removed from server.
		public static const PRESENTATION_REMOVED_EVENT:String = "Presentation Removed Event";
		
		public var presentationName:String;
		
		public function RemovePresentationEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}