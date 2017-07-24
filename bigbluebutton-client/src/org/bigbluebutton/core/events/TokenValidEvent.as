package org.bigbluebutton.core.events
{
	import flash.events.Event;
	
	public class TokenValidEvent extends Event
	{
		public static const TOKEN_VALID_EVENT:String = "auth token valid event";
		
		public function TokenValidEvent() 
		{
			super(TOKEN_VALID_EVENT, true, false);
		}
		
	}

}