package org.bigbluebutton.main.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.main.model.ConferenceParameters;
	import org.bigbluebutton.main.model.users.BBBUser;

	public class SuccessfulLoginEvent extends Event
	{
		public static const USER_LOGGED_IN:String = "SuccessfullyLoggedIn";
		
		public var conferenceParameters:ConferenceParameters;
		
		public function SuccessfulLoginEvent(type:String)
		{
			super(type, true, false);
		}
	}
}