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

package org.bigbluebutton.api.domain;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;

public class Recording {
	private String id;
	private String meetingID;
	private String name;
	private boolean published;
	private String startTime;
	private String endTime;
	private Map<String, String> metadata = new HashMap<String, String>();
	private ArrayList<Playback> playbacks=new ArrayList<Playback>();
	
	//TODO: 
	private String state;
	private String playbackLink;
	private String playbackFormat;
	
	
	public String getId() {
		return id;
	}
	
	public void setId(String id) {
		this.id = id;
	}
	
	public String getState() {
		return state;
	}
	
	public void setState(String state) {
		this.state = state;
	}
	
	public boolean isPublished() {
		return published;
	}
	
	public void setPublished(boolean published) {
		this.published = published;
	}
	
	public String getStartTime() {
		return startTime;
	}
	
	public void setStartTime(String startTime) {
		this.startTime = convertOldDateFormat(startTime);
	}
	
	public String getEndTime() {
		return endTime;
	}
	
	public void setEndTime(String endTime) {
		this.endTime = convertOldDateFormat(endTime);
	}
	
	public String getPlaybackLink() {
		return playbackLink;
	}
	
	public void setPlaybackLink(String playbackLink) {
		this.playbackLink = playbackLink;
	}

	public String getPlaybackFormat() {
		return playbackFormat;
	}
	
	public void setPlaybackFormat(String playbackFormat) {
		this.playbackFormat = playbackFormat;
	}
	
	public Map<String, String> getMetadata() {
		return metadata;
	}
	
	public void setMetadata(Map<String, String> metadata) {
		this.metadata = metadata;
	}

	public String getMeetingID() {
		return meetingID;
	}

	public void setMeetingID(String meetingID) {
		this.meetingID = meetingID;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public ArrayList<Playback> getPlaybacks() {
		return playbacks;
	}

	public void setPlaybacks(ArrayList<Playback> playbacks) {
		this.playbacks = playbacks;
	}
	
	/* We used to have an old date format in the recordings 
	 * e.g.: Thu Mar 04 14:05:56 UTC 2010
	 * Now, we have a new one which it's a long string
	 * This method converts the old date format to the new one */
	
	private String convertOldDateFormat(String olddate){
		String newdate = olddate;

		try {
			SimpleDateFormat sdf = new SimpleDateFormat("EEE MMM d HH:mm:ss z yyyy");
			Calendar cal=Calendar.getInstance();
			sdf.setLenient(false);
			
			cal.setTime(sdf.parse(olddate));
			newdate = Long.toString(cal.getTimeInMillis());
		} catch (ParseException pe) {
			
		}

		return newdate;
	}
	
}

/*
<recording>
	<id>Demo Meeting-3243244</id>
	<state>available</state>
	<published>true</published>
	<start_time>Thu Mar 04 14:05:56 UTC 2010</start_time>
	<end_time>Thu Mar 04 15:01:01 UTC 2010</end_time>	
	<playback>
		<format>simple</format>
		<link>http://server.com/simple/playback?recordingID=Demo Meeting-3243244</link> 	
	</playback>
	<meta>
		<title>Test Recording 2</title>
		<subject>English 232 session</subject>
		<description>Second  test recording</description>
		<creator>Omar Shammas</creator>
		<contributor>Blindside</contributor>
		<language>en_US</language>
	</meta>
</recording>
*/