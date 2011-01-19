/* BigBlueButton - http://www.bigbluebutton.org
 * 
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * @author Jeremy Thomerson <jthomerson@genericconf.com>
 * @version $Id: $
 */
package org.bigbluebutton.api.domain;

import org.apache.commons.lang.RandomStringUtils;
import java.util.Date;
import java.util.UUID;
import org.apache.commons.lang.StringUtils;

public class DynamicConference {
	private Date dateCreated;
	private Date lastUpdated;
	private String createdBy;
	private String updatedBy;
	private String name;
	private Integer conferenceNumber;
	 
	private Date storedTime;
	private Date startTime;
	private Date endTime;
	
	private boolean forciblyEnded = false;
	
	private String meetingID;
	private String meetingToken;
	private String voiceBridge;
	private String webVoiceConf;
	private String moderatorPassword;
	private String attendeePassword;
	private String welcome;
	private String logoutUrl;
	private int maxParticipants;
	private boolean record;

	public DynamicConference(String name, String meetingID, String attendeePW, String moderatorPW, int maxParticipants) {
		this.name = name;
		this.meetingID = (StringUtils.isEmpty(meetingID) ? "" : meetingID);
		this.attendeePassword = (attendeePW == null ? createPassword() : attendeePW);
		this.moderatorPassword = (moderatorPW == null ? createPassword() : moderatorPW);
		this.maxParticipants = maxParticipants < 0 ? -1 : maxParticipants;
		this.meetingToken = createMeetingToken();
	}

	public static String createMeetingToken() {
		return UUID.randomUUID().toString();
	}

	public static String createPassword() {
		return RandomStringUtils.randomAlphanumeric(8).toLowerCase();
	}

	public boolean isRunning() {
		boolean running = startTime != null && endTime == null;
		//println "running: ${running}; startTime: ${startTime}; endTime: ${endTime}"; 
		return running;
	}

	@Override
	public String toString() {
		return "DynamicConference: " + this.meetingToken + "[" + this.meetingID + "|" + this.voiceBridge + "]:" + this.name;
	}

}
