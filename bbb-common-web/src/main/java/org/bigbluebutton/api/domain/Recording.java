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

import java.math.BigInteger;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public class Recording {
	private String id;
	private String meetingID;
	private String name;
	private boolean published;
	private String startTime;
	private String endTime;
	private String numParticipants;
	private String rawSize;
	private Map<String, String> metadata = new TreeMap<String, String>();
	private List<Playback> playbacks=new ArrayList<Playback>();
	
	//TODO: 
	private String state;
	private String playbackLink;
	private String playbackFormat;
	private String playbackDuration;
	private String playbackSize;
	private String processingTime;
	private List<Extension> playbackExtensions;

	private String downloadLink;
	private String downloadFormat;
	private String downloadMd5;
	private String downloadKey;
	private String downloadSize;

	public static final String STATE_PROCESSING = "processing";
	public static final String STATE_PROCESSED = "processed";
	public static final String STATE_PUBLISING = "publishing";
	public static final String STATE_PUBLISHED = "published";
	public static final String STATE_UNPUBLISING = "unpublishing";
	public static final String STATE_UNPUBLISHED = "unpublished";
	public static final String STATE_DELETING = "deleting";
	public static final String STATE_DELETED = "deleted";

	public String getId() {
		return id;
	}
	
	public void setId(String id) {
		this.id = id;
	}
	
	public String getState() {
	    String state = this.state;
	    if ( state == null || "".equals(state) || "available".equals(state) ) {
	        state = isPublished()? STATE_PUBLISHED: STATE_UNPUBLISHED;
	    }
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
	
	public void setNumParticipants(String numParticipants) {
		this.numParticipants = numParticipants;
	}

	public String getNumParticipants() {
		return numParticipants;
	}

	public void setEndTime(String endTime) {
		this.endTime = convertOldDateFormat(endTime);
	}
	
	public String getSize() {
		BigInteger size = BigInteger.ZERO;
		for (Playback p: playbacks) {
			if (p.getSize().length() > 0) {
				size = size.add(new BigInteger(p.getSize()));
			}
		}
		return size.toString();
	}

	public String getRawSize() {
		return rawSize;
	}

	public void setRawSize(String rawSize) {
		this.rawSize = rawSize;
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
	
	public String getPlaybackDuration() {
		return playbackDuration;
	}
	
	public void setPlaybackDuration(String playbackDuration) {
		this.playbackDuration = playbackDuration;
	}

	public String getPlaybackSize() {
		return playbackSize;
	}

	public void setPlaybackSize(String playbackSize) {
		this.playbackSize = playbackSize;
	}

	public String getProcessingTime() {
		return processingTime;
	}

	public void setProcessingTime(String processingTime) {
		this.processingTime = processingTime;
	}

	public List<Extension> getPlaybackExtensions() {
		return playbackExtensions;
	}

	public void setPlaybackExtensions(List<Extension> playbackExtensions) {
		this.playbackExtensions = playbackExtensions;
	}
	
	public Map<String, String> getMetadata() {
		return this.metadata;
	}

	public String getMetadata(String key) {
		return this.metadata.get(key);
	}

	public void setMetadata(Map<String, String> metadata) {
		this.metadata = metadata;
	}

	public void updateMetadata(String key, String value) {
		this.metadata.put(key, value);
	}

	public void deleteMetadata(String key) {
		this.metadata.remove(key);
	}

	public boolean containsMetadata(String key) {
		return this.metadata.containsKey(key);
	}

	public String getMeetingID() {
		return this.meetingID;
	}

	public void setMeetingID(String meetingID) {
		this.meetingID = meetingID;
	}

	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public List<Playback> getPlaybacks() {
		return playbacks;
	}

	public void setPlaybacks(List<Playback> playbacks) {
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
	
	public String getExternalMeetingId() {
		String externalMeetingId = null;
		if (this.metadata != null) {
			externalMeetingId = this.metadata.get("meetingId");
		}

		if (externalMeetingId != null) {
			return externalMeetingId;
		} else {
			return "";
		}
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