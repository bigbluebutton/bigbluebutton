package org.bigbluebutton.main.model.users.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.main.model.users.Conference;

	public class ConferenceCreatedEvent extends Event
	{
		public static const CONFERENCE_CREATED_EVENT:String = "conferenceCreated";
		
		public var conference:Conference;
		
		public function ConferenceCreatedEvent(type:String)
		{
			super(type, true, false);
		}
	}
}