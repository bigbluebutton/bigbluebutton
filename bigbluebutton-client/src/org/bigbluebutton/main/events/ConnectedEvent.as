package org.bigbluebutton.main.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.main.model.Participant;

	public class ConnectedEvent extends Event
	{
		public static const CONNECTED_EVENT:String = 'connectedEvent';
		
		public var participant:Participant;
		
		public function ConnectedEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}