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
import groovy.util.slurpersupport.GPathResult;

public class Recording {
	private String id;
	private String meetingID;
	private String name;
	private boolean published;
	private String startTime;
	private String endTime;
	private String rawSize;
	private Map<String, String> metadata = new HashMap<String, String>();
	private ArrayList<Playback> playbacks=new ArrayList<Playback>();
	private ArrayList<Download> downloads=new ArrayList<Download>();
	
	//TODO: 
	private String state;
	private String playbackLink;
	private String playbackFormat;
	private String playbackDuration;
	private String playbackSize;
	private GPathResult playbackExtensions;
	
	private String downloadLink;
	private String downloadFormat;
	private String downloadMd5;
	private String downloadKey;
	private String downloadSize;

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

	public String getSize() {
		int size = 0;
		for (Playback p: playbacks) {
			size += Integer.parseInt(p.getSize());
		}
		for (Download p: downloads) {
			size += Integer.parseInt(p.getSize());
		}
		return String.valueOf(size);
	}

	public String getRawSize() {
		return rawSize;
	}

	public void setRawSize(String rawSize) {
		this.rawSize = rawSize;
	}

	public String getDownloadLink() {
		return downloadLink;
	}
	
	public void setDownloadLink(String downloadLink) {
		this.downloadLink = downloadLink;
	}

	public String getDownloadFormat() {
		return downloadFormat;
	}
	
	public void setDownloadFormat(String downloadFormat) {
		this.downloadFormat = downloadFormat;
	}

	public String getDownloadMd5() {
		return downloadMd5;
	}
	
	public void setDownloadMd5(String downloadMd5) {
		this.downloadMd5 = downloadMd5;
	}

	public String getDownloadKey() {
		return downloadKey;
	}
	
	public void setDownloadKey(String downloadKey) {
		this.downloadKey = downloadKey;
	}

	public String getDownloadSize() {
		return downloadSize;
	}

	public void setDownloadSize(String downloadSize) {
		this.downloadSize = downloadSize;
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

	public GPathResult getPlaybackExtensions() {
		return playbackExtensions;
	}

	public void setPlaybackExtensions(GPathResult playbackExtensions) {
		this.playbackExtensions = playbackExtensions;
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

	public ArrayList<Download> getDownloads() {
		return downloads;
	}

	public void setDownloads(ArrayList<Download> downloads) {
		this.downloads = downloads;
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