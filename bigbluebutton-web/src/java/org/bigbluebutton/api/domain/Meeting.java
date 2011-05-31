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

import java.util.ArrayList;
import java.util.Date;
import java.util.Hashtable;
import java.util.Map;

public class Meeting {
	private String name;
	private String extMeetingId;
	private String intMeetingId;
	
	private int duration;	 
	private long createdTime;
	private long startTime;
	private long endTime;
	
	private boolean forciblyEnded = false;
	
	private String telVoice;
	private String webVoice;
	private String moderatorPass;
	private String viewerPass;
	private String welcomeMsg;
	private String logoutUrl;
	private int maxUsers;
	
	private boolean record;
	
	private Hashtable<String,String> metadata;
	private ArrayList<Participant> participants; 

	public Meeting(Builder builder) {
		this.name = builder.name;
		this.extMeetingId = builder.externalId;
		this.intMeetingId = builder.internalId;
		this.viewerPass = builder.viewerPass;
		this.moderatorPass = builder.moderatorPass;
		this.maxUsers = builder.maxUsers;
		
		this.participants = new ArrayList<Participant>();
		this.metadata = new Hashtable<String, String>();
		addMetadataValue("title", "Default Title");
	}

	public boolean isRunning() {
//		boolean running = startTime != null && endTime == null;
		//println "running: ${running}; startTime: ${startTime}; endTime: ${endTime}"; 
		return true;
	}

	public String getName() {
		return name;
	}

	public boolean isForciblyEnded() {
		return forciblyEnded;
	}

	public void setForciblyEnded(boolean forciblyEnded) {
		this.forciblyEnded = forciblyEnded;
	}

	/**
	 * Get the external meeting id.
	 * @return external meeting id.
	 */
	public String getExternalId() {
		return extMeetingId;
	}
	
	/**
	 * Get the internal meeting id;
	 */
	public String getInternalId() {
		return intMeetingId;
	}

	public String getWebVoice() {
		return webVoice;
	}

	public String getTelVoice() {
		return telVoice;
	}

	public String getModeratorPassword() {
		return moderatorPass;
	}

	public String getViewerPassword() {
		return viewerPass;
	}

	public String getWelcomeMessage() {
		return welcomeMsg;
	}

	public String getLogoutUrl() {
		return logoutUrl;
	}

	public int getMaxUsers() {
		return maxUsers;
	}

	public boolean isRecord() {
		return record;
	}
	

	public void ParticipantJoined(Participant participant){
		this.participants.add(participant);
	}
	
	public void ParticipantLeft(String userid){
		for(Participant p: this.participants){
			if(p.getUserid().equalsIgnoreCase(userid)){
				this.participants.remove(p);
				break;
			}
		}		
	}
	
	public int getNumberOfUsers(){
		return this.participants.size();
	}
	
	public int getNumberOfModerators(){
		int sum = 0;
		for(Participant p: this.participants){
			if (p.isModerator()) {
				sum++;
			}
		} 
		return sum;
	}
	
	public ArrayList<Participant> getParticipants(){
		return this.participants;
	}
	
	public void addMetadataValue(String key, String value){
		this.metadata.put(key, value);
	}
	
	public Hashtable<String,String> getMetadata(){
		return this.metadata;
	}
	
	/***
	 * Meeting Builder
	 *
	 */
	public static class Builder {
    	private String name;
    	private String externalId;
    	private String internalId;
    	
    	private int maxUsers;
    	private boolean record;
    	private String moderatorPass;
    	private String viewerPass;
    	private int duration;
    	private String webVoice;
    	private String telVoice;
    	private String welcomeMsg;
    	private String logoutUrl;
    	private Map<String, String> metadata;
    	private String dialNumber;
    	
    	public Builder() {}
    	
    	public Builder withName(String name) {
    		this.name = name;
    		return this;
    	}
    	
    	public Builder withExternalId(String id) {
    		externalId = id;
    		return this;
    	}
    	
    	public Builder withInternalId(String id) {
    		internalId = id;
    		return this;
    	}
    	
    	public Builder withDuration(int minutes) {
    		duration = minutes;
    		return this;
    	}
    	
    	public Builder withMaxUsers(int n) {
    		maxUsers = n;
    		return this;
    	}
    	
    	public Builder withRecording(boolean record) {
    		this.record = record;
    		return this;
    	}

    	public Builder withWebVoice(String w) {
    		this.webVoice = w;
    		return this;
    	}
    	
    	public Builder withTelVoice(String t) {
    		this.telVoice = t;
    		return this;
    	}
    	
    	public Builder withDialNumber(String d) {
    		this.dialNumber = d;
    		return this;
    	}
    	
    	public Builder withModeratorPass(String p) {
    		this.moderatorPass = p;
    		return this;
    	}
    	
    	public Builder withViewerPass(String p) {  		
	    	this.viewerPass = p;
	    	return this;
	    }
    	
    	public Builder withWelcomeMessage(String w) {
    		welcomeMsg = w;
    		return this;
    	}
    	
    	public Builder withLogoutUrl(String l) {
    		logoutUrl = l;
    		return this;
    	}
    	
    	public Builder withMetadata(Map<String, String> m) {
    		metadata = m;
    		return this;
    	}
    
    	public Meeting build() {
    		return new Meeting(this);
    	}
    }
}
