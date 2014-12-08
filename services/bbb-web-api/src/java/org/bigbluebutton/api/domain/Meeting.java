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

import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.apache.commons.lang.RandomStringUtils;

public class Meeting {
	private static final long MILLIS_IN_A_MINUTE = 60000;
	
	private String name;
	private String extMeetingId;
	private String intMeetingId;	
	private long duration = 0;	 
	private long createdTime = 0;
	private long startTime = 0;
	private long endTime = 0;
	private boolean forciblyEnded = false;
	private String telVoice;
	private String webVoice;
	private String moderatorPass;
	private String viewerPass;
	private String welcomeMsg;
	private String logoutUrl;
	private int maxUsers;
	private boolean record;
	private String dialNumber;
	private String defaultAvatarURL;
	private String defaultConfigToken;
	
	private Map<String, String> metadata;
	private Map<String, Object> userCustomData;
	private final ConcurrentMap<String, User> users; 
	private final ConcurrentMap<String, Config> configs;
	
	public Meeting(Builder builder) {
		name = builder.name;
		extMeetingId = builder.externalId;
		intMeetingId = builder.internalId;
		viewerPass = builder.viewerPass;
		moderatorPass = builder.moderatorPass;
		maxUsers = builder.maxUsers;
		logoutUrl = builder.logoutUrl;
		defaultAvatarURL = builder.defaultAvatarURL;
		record = builder.record;
    	duration = builder.duration;
    	webVoice = builder.webVoice;
    	telVoice = builder.telVoice;
    	welcomeMsg = builder.welcomeMsg;
    	dialNumber = builder.dialNumber;
    	metadata = builder.metadata;
    	createdTime = builder.createdTime;
    	userCustomData = new HashMap<String, Object>();
		users = new ConcurrentHashMap<String, User>();
		
		configs = new ConcurrentHashMap<String, Config>();
	}

	public String storeConfig(boolean defaultConfig, String config) {
		String token = RandomStringUtils.randomAlphanumeric(8);
		while (configs.containsKey(token)) {
			token = RandomStringUtils.randomAlphanumeric(8);
		}
		
		configs.put(token, new Config(token, System.currentTimeMillis(), config));
		
		if (defaultConfig) {
			defaultConfigToken = token;
		}
		
		return token;
	}
	
	public Config getDefaultConfig() {
		if (defaultConfigToken != null) {
			return getConfig(defaultConfigToken);
		}
		
		return null;
	}
	
	public Config getConfig(String token) {
		return configs.get(token);
	}
	
	public Config removeConfig(String token) {
		return configs.remove(token);
	}
	
	public Map<String, String> getMetadata() {
		return metadata;
	}
	
	public Collection<User> getUsers() {
		return users.isEmpty() ? Collections.<User>emptySet() : Collections.unmodifiableCollection(users.values());
	}
	
	public long getStartTime() {
		return startTime;
	}
	
	public void setStartTime(long t) {
		startTime = t;
	}
	
	public long getCreateTime() {
		return createdTime;
	}
	
	public long getDuration() {
		return duration;
	}
	
	public long getEndTime() {
		return endTime;
	}
	
	public void setEndTime(long t) {
		endTime = t;
	}
	
	public boolean isRunning() {
		return ! users.isEmpty();
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

	public String getDefaultAvatarURL() {
		return defaultAvatarURL;
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
	
	public void userJoined(User user){
		this.users.put(user.getInternalUserId(), user);
	}
	
	public User userLeft(String userid){
		return users.remove(userid);		
	}
	
	public User getUserById(String id){
		return this.users.get(id);
	}
	
	public int getNumUsers(){
		return this.users.size();
	}
	
	public int getNumModerators(){
		int sum = 0;
		for (String key : users.keySet()) {
		    User u =  (User) users.get(key);
		    if (u.isModerator()) sum++;
		}
		return sum;
	}
	
	public String getDialNumber() {
		return dialNumber;
	}
	
	public boolean wasNeverStarted(int expiry) {
		return (!hasStarted() && !hasEnded() && nobodyJoined(expiry));
	}
	
	private boolean nobodyJoined(int expiry) {
		if (expiry == 0) return false; /* Meeting stays created infinitely */
		return (System.currentTimeMillis() - createdTime) >  (expiry * MILLIS_IN_A_MINUTE);
	}
	
	public boolean hasExpired(int expiry) {
		System.out.println("meeting-id=" + intMeetingId + " started=" + hasStarted() + " ended=" + hasEnded() + " notRunning=" + !isRunning() + " expired=" + didExpire(expiry));
		return (hasStarted() && hasEnded() && !isRunning() && didExpire(expiry));
	}
	
	public boolean hasExceededDuration() {
		return (hasStarted() && !hasEnded() && pastDuration());
	}

	private boolean pastDuration() {
		if (duration == 0) return false; /* Meeting runs infinitely */
		return (System.currentTimeMillis() - startTime > (duration * MILLIS_IN_A_MINUTE));
	}
	
	private boolean hasStarted() {
		return startTime > 0;
	}
	
	private boolean hasEnded() {
		return endTime > 0;
	}
	
	private boolean didExpire(int expiry) {
		long now = System.currentTimeMillis();
		System.out.println("Expiry " + now + " endTime=" + endTime + "expiry=" + (expiry * MILLIS_IN_A_MINUTE));
		return (System.currentTimeMillis() - endTime > (expiry * MILLIS_IN_A_MINUTE));
	}
	
	public void addUserCustomData(String userID, Map<String, String> data) {
		userCustomData.put(userID, data);
	}
	
	public Map getUserCustomData(String userID){
		return (Map) userCustomData.get(userID);
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
    	private String defaultAvatarURL;
    	private long createdTime;
    	
    	public Builder(String externalId, String internalId, long createTime) {
    		this.externalId = externalId;
    		this.internalId = internalId;
    		this.createdTime = createTime;
    	}
    	
    	public Builder withName(String name) {
    		this.name = name;
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
    	
    	public Builder withDefaultAvatarURL(String w) {
    		defaultAvatarURL = w;
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
