package org.bigbluebutton.modules.viewers.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.viewers.business.Conference;

	public class ConferenceCreatedEvent extends Event
	{
		public static const CONFERENCE_CREATED_EVENT:String = "CONFERENCE_CREATED";
		
		public var conference:Conference;
		
		public function ConferenceCreatedEvent(type:String)
		{
			super(type, true, false);
		}
	}
}