/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebutton.modules.voiceconference.model.vo
{
	
	
	/**
	 * Represents a user in the MeetMeRoom
	 * @author dev_team@bigbluebutton.org
	 * 
	 */	
	public class VoiceConferenceUser
	{
	[RemoteClass(alias="org.blindsideproject.asterisk.meetme.vo.MeetMeUserVo")]		

		public var roomNumber : String;
		public var callerIdName : String;
		public var callerIdNumber : String;
		public var dateJoined : Date;
		public var dateLeft : Date;
		public var userNumber : Number;
		public var muted : Boolean;
		public var talking : Boolean;	
		
			
	}
}