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

package org.bigbluebutton.api.messaging;

import java.util.List;
import java.util.Map;

public interface MessagingService {	
	public void start();
	public void stop();
	public void recordMeetingInfo(String meetingId, Map<String, String> info);
	public void destroyMeeting(String meetingID);
	public void createMeeting(String meetingID, Boolean recorded, String voiceBridge);
	public void endMeeting(String meetingId);
	public void send(String channel, String message);
	public void addListener(MessageListener listener);
	public void removeListener(MessageListener listener);
	public void sendPolls(String meetingId, String title, String question, String questionType, List<String> answers);
	public String storeSubscription(String meetingId, String externalMeetingID, String callbackURL);
	public boolean removeSubscription(String meetingId, String subscriptionId);
	public List<Map<String,String>> listSubscriptions(String meetingId);
}
