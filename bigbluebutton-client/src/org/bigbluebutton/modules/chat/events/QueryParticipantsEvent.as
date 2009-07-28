package org.bigbluebutton.modules.chat.events
{
	import flash.events.Event;

	public class QueryParticipantsEvent extends Event
	{
		public static const QUERY_PARTICIPANTS_EVENT:String = 'QUERY_PARTICIPANTS_EVENT';
		
		public function QueryParticipantsEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}