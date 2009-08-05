package org.bigbluebutton.main.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.main.model.Participant;

	public class ParticipantJoinEvent extends Event
	{
		public static const PARTICIPANT_JOINED_EVENT:String = 'PARTICIPANT_JOINED_EVENT';
		
		public var participant:Participant;
		public var join:Boolean = false;
		public function ParticipantJoinEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}