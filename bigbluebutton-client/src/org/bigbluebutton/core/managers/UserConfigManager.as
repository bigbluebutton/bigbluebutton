/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */
package org.bigbluebutton.core.managers {

	import org.bigbluebutton.main.model.ConferenceParameters;

	public class UserConfigManager {
		private var conferenceParameters:ConferenceParameters = null;

		public function setConferenceParameters(c:ConferenceParameters):void {
			conferenceParameters = c;
		}

    public function getConfParams():ConferenceParameters {
      return conferenceParameters;
    }
    
		public function getLogoutUrl():String {
			if (conferenceParameters == null)
				return null;
			return conferenceParameters.logoutUrl;
		}

		public function getWelcomeMessage():String {
			if (conferenceParameters == null)
				return null;
			return conferenceParameters.welcome;
		}

		public function getMeetingTitle():String {
			if (conferenceParameters)
				return conferenceParameters.meetingName;
			else
				return null;
		}
	}
}
