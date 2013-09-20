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
	
	void addUser();
	
	User getUser(String token);
	
	User removeUser(String token);
		
	void removeExpiredMeetings();
	
	void destroyMeeting(String meetingID);
	
	Collection<Meeting> getMeetings();

	String addSubscription(String meetingId, String event, String callbackURL);

	boolean removeSubscription(String meetingId, String subscriptionId);

	List<Map<String,String>> listSubscriptions(String meetingId);

	Meeting getMeeting(String meetingId);

	HashMap<String,Recording> getRecordings(ArrayList<String> idList);
	
	HashMap<String,Recording> reorderRecordings(ArrayList<Recording> olds);
		
	boolean existsAnyRecording(ArrayList<String> idList);
	
	void setPublishRecording(ArrayList<String> idList,boolean publish);
	
	void setRemoveMeetingWhenEnded(boolean s);
	
	void deleteRecordings(ArrayList<String> idList);
	
	void processRecording(String meetingId);
		
	void createdPolls(String meetingId, String title, String question, String questionType, ArrayList<String> answers);
	
	void endMeeting(String meetingId);
	
	void addUserCustomData(String meetingId, String userID, Map<String,String> userCustomData);


}
