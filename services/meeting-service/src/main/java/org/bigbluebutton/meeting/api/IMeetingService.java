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

package org.bigbluebutton.meeting.api;

public interface IMeetingService {
	
	/**
	 * Query if a meeting is present.
	 * @param id
	 * @return true/false
	 */
	boolean hasMeeting(String id);
	
	/**
	 * Create a meeting.
	 * NOTE:
	 *  Callers should call {@link}hasMeeting first to determine if a meeting with
	 *  id is already running.
	 * @return
	 */
	String createMeeting();
	
	/**
	 * Request to end a meeting.
	 * @param id
	 * @return
	 */
	boolean endMeeting(String id);
	
	/**
	 * A user wants to join a meeting.
	 * @return
	 */
	String joinUser();
	
	User getUser(String userID);
	
	User removeUser(String token);
	
	
	void removeExpiredMeetings();
	
	void destroyMeeting(String meetingID);
	
	Collection<Meeting> getMeetings();


}
