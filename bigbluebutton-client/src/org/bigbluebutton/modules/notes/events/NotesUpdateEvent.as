package org.bigbluebutton.modules.notes.events
{
	import flash.events.Event;
	
	/**
	 * NotesUpdateEvent contains an update sent to the shared object to update the notes 
	 * @author Snap
	 * 
	 */	
	public class NotesUpdateEvent extends Event
	{
		public static const NEW:String = "newMessageEvent";
		public var message:String;
		
		public function NotesUpdateEvent(type:String, bubbles:Boolean = true, cancelable:Boolean = false)
		{
			super(type, bubbles, cancelable);
		}

	}
}