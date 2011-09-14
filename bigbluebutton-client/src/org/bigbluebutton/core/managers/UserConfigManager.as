package org.bigbluebutton.core.managers
{
	import org.bigbluebutton.main.model.ConferenceParameters;

	public class UserConfigManager
	{
		private var conferenceParameters:ConferenceParameters = null;
		
		public function setConferenceParameters(c:ConferenceParameters):void {
			conferenceParameters = c;
		}
		
		public function getLogoutUrl():String {
			return conferenceParameters.logoutUrl;
		}
	}
}