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

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.apache.commons.lang3.RandomStringUtils;

public class Meeting {

	public static final String ROLE_MODERATOR = "MODERATOR";
	public static final String ROLE_ATTENDEE = "VIEWER";

	private String name;
	private String extMeetingId;
	private String intMeetingId;
	private String parentMeetingId = "bbb-none"; // Initialize so we don't send null in the json message.
	private Integer sequence = 0;
	private Boolean freeJoin = false;
    private Integer duration = 0;	 
	private long createdTime = 0;
	private long startTime = 0;
	private long endTime = 0;
	private boolean forciblyEnded = false;
	private String telVoice;
	private String webVoice;
	private String moderatorPass;
	private String viewerPass;
	private String welcomeMsgTemplate;
	private String welcomeMsg;
	private String modOnlyMessage = "";
	private String logoutUrl;
	private int logoutTimer = 0;
	private int maxUsers;
	private String bannerColor = "#FFFFFF";
	private String bannerText = "";
	private boolean record;
	private boolean autoStartRecording = false;
	private boolean allowStartStopRecording = false;
	private boolean webcamsOnlyForModerator = false;
	private String dialNumber;
	private String defaultAvatarURL;
	private String defaultConfigToken;
	private String guestPolicy = GuestPolicy.ASK_MODERATOR;
	private boolean userHasJoined = false;
	private Map<String, String> metadata;
	private Map<String, Object> userCustomData;
	private final ConcurrentMap<String, User> users;
	private final ConcurrentMap<String, RegisteredUser> registeredUsers;
	private final ConcurrentMap<String, Config> configs;
	private final Boolean isBreakout;
	private final List<String> breakoutRooms = new ArrayList<>();
	private String customLogoURL = "";
	private String customCopyright = "";
	private Boolean muteOnStart = false;

	private Integer maxInactivityTimeoutMinutes = 120;
	private Integer warnMinutesBeforeMax = 5;
	private Integer meetingExpireIfNoUserJoinedInMinutes = 5;
	private Integer meetingExpireWhenLastUserLeftInMinutes = 1;

    public Meeting(Meeting.Builder builder) {
        name = builder.name;
        extMeetingId = builder.externalId;
        intMeetingId = builder.internalId;
        viewerPass = builder.viewerPass;
        moderatorPass = builder.moderatorPass;
        maxUsers = builder.maxUsers;
        bannerColor = builder.bannerColor;
        bannerText = builder.bannerText;
        logoutUrl = builder.logoutUrl;
        logoutTimer = builder.logoutTimer;
        defaultAvatarURL = builder.defaultAvatarURL;
        record = builder.record;
        autoStartRecording = builder.autoStartRecording;
        allowStartStopRecording = builder.allowStartStopRecording;
        webcamsOnlyForModerator = builder.webcamsOnlyForModerator;
        duration = builder.duration;
        webVoice = builder.webVoice;
        telVoice = builder.telVoice;
        welcomeMsgTemplate = builder.welcomeMsgTemplate;
        welcomeMsg = builder.welcomeMsg;
        dialNumber = builder.dialNumber;
        metadata = builder.metadata;
        createdTime = builder.createdTime;
        isBreakout = builder.isBreakout;
        guestPolicy = builder.guestPolicy;

        userCustomData = new HashMap<>();

        users = new ConcurrentHashMap<>();
        registeredUsers = new ConcurrentHashMap<>();

        configs = new ConcurrentHashMap<>();
    }

	public void addBreakoutRoom(String meetingId) {
		breakoutRooms.add(meetingId);
	}

	public List<String> getBreakoutRooms() {
		return breakoutRooms;
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

	public ConcurrentMap<String, User> getUsersMap() {
	    return users;
	}

	public void setGuestStatusWithId(String userId, String guestStatus) {
    	User user = getUserById(userId);
    	if (user != null) {
    		user.setGuestStatus(guestStatus);
		}

		RegisteredUser ruser = registeredUsers.get(userId);
		if (ruser != null) {
			ruser.setGuestStatus(guestStatus);
		}

	}

	public RegisteredUser getRegisteredUserWithAuthToken(String authToken) {
		for (RegisteredUser ruser : registeredUsers.values()) {
			if (ruser.authToken.equals(authToken)) {
				return ruser;
			}
		}

		return null;
	}

	public String getGuestStatusWithAuthToken(String authToken) {
		RegisteredUser rUser = getRegisteredUserWithAuthToken(authToken);
		if (rUser != null) {
			return rUser.getGuestStatus();
		}

		return GuestPolicy.DENY;
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

	public void setSequence(Integer s) {
        sequence = s;
    }

	public Integer getSequence() {
        return sequence;
    }

    public Boolean isFreeJoin() {
        return freeJoin;
    }

    public void setFreeJoin(Boolean freeJoin) {
        this.freeJoin = freeJoin;
    }
	
	public Integer getDuration() {
		return duration;
	}
	
	public long getEndTime() {
		return endTime;
	}
	
	public void setModeratorOnlyMessage(String msg) {
		modOnlyMessage = msg;
	}
	
	public String getModeratorOnlyMessage() {
		return modOnlyMessage;
	}
	
	public void setEndTime(long t) {
		endTime = t;
	}
	
	public boolean isRunning() {
		return ! users.isEmpty();
	}
	
	public Boolean isBreakout() {
	  return isBreakout;
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

	public String getExternalId() {
		return extMeetingId;
	}
	
	public String getInternalId() {
		return intMeetingId;
	}

	public void setParentMeetingId(String p) {
        parentMeetingId = p;
    }

	public String getParentMeetingId() {
	    return parentMeetingId;
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
	
    public String getWelcomeMessageTemplate() {
        return welcomeMsgTemplate;
    }

	public String getWelcomeMessage() {
		return welcomeMsg;
	}

	public String getDefaultAvatarURL() {
		return defaultAvatarURL;
	}

	public void setGuestPolicy(String policy) {
		guestPolicy = policy;
	}

	public String getGuestPolicy() {
    	return guestPolicy;
	}


	public String calcGuestStatus(String role, Boolean guest, Boolean authned) {
		if (GuestPolicy.ALWAYS_ACCEPT.equals(guestPolicy)) {
			return GuestPolicy.ALLOW;
		} else if (GuestPolicy.ALWAYS_DENY.equals(guestPolicy)) {
			return GuestPolicy.DENY;
		} else if (GuestPolicy.ASK_MODERATOR.equals(guestPolicy)) {
			if (!ROLE_MODERATOR.equals(role) && (guest)) {
				return GuestPolicy.WAIT ;
			}
			return GuestPolicy.ALLOW;
		} else if (GuestPolicy.ALWAYS_ACCEPT_AUTH.equals(guestPolicy)) {
			if (guest){
				// Only ask moderator for guests.
				return GuestPolicy.WAIT ;
			}
			return GuestPolicy.ALLOW;
		}
		return GuestPolicy.DENY ;
	}


	public String getLogoutUrl() {
		return logoutUrl;
	}

	public int getMaxUsers() {
		return maxUsers;
	}
	
	public int getLogoutTimer() {
		return logoutTimer;
	}
	
	public String getBannerColor() {
		return bannerColor;
	}
	
	public String getBannerText() {
		return bannerText;
	}

	public boolean isRecord() {
		return record;
	}
	
	public boolean getAutoStartRecording() {
		return autoStartRecording;
	}
	
	public boolean getAllowStartStopRecording() {
		return allowStartStopRecording;
	}
	
    public boolean getWebcamsOnlyForModerator() {
        return webcamsOnlyForModerator;
    }
	
	public boolean hasUserJoined() {
		return userHasJoined;
	}

	public String getCustomLogoURL() {
		return customLogoURL;
	}

	public void setCustomLogoURL(String url) {
		customLogoURL = url;
	}

	public void setCustomCopyright(String copyright) {
    	customCopyright = copyright;
	}

	public String getCustomCopyright() {
    	return customCopyright;
	}

	public void setMuteOnStart(Boolean mute) {
    	muteOnStart = mute;
	}

	public Boolean getMuteOnStart() {
    	return muteOnStart;
	}

	public void userJoined(User user) {
	    userHasJoined = true;
	    this.users.put(user.getInternalUserId(), user);
	}

	public User userLeft(String userid){
		return (User) users.remove(userid);	
	}

	public User getUserById(String id){
		return this.users.get(id);
	}

	public User getUserWithExternalId(String externalUserId) {
		for (String key : users.keySet()) {
			User u = users.get(key);
			if (u.getExternalUserId().equals(externalUserId)) {
				return u;
			}
		}
		return null;
	}

	public int getNumUsers(){
		return this.users.size();
	}
	
	public int getNumModerators(){
		int sum = 0;
		for (String key : users.keySet()) {
		    User u =  users.get(key);
		    if (u.isModerator()) sum++;
		}
		return sum;
	}
	
	public String getDialNumber() {
		return dialNumber;
	}

	public int getNumListenOnly() {
		int sum = 0;
		for (String key : users.keySet()) {
			User u =  users.get(key);
			if (u.isListeningOnly()) sum++;
		}
		return sum;
	}
	
	public int getNumVoiceJoined() {
		int sum = 0;
		for (String key : users.keySet()) {
			User u =  users.get(key);
			if (u.isVoiceJoined()) sum++;
		}
		return sum;
	}

	public int getNumVideos() {
		int sum = 0;
		for (String key : users.keySet()) {
			User u =  users.get(key);
			sum += u.getStreams().size();
		}
		return sum;
	}
	
	public void addUserCustomData(String userID, Map<String, String> data) {
		userCustomData.put(userID, data);
	}

	public void setMaxInactivityTimeoutMinutes(Integer value) {
		maxInactivityTimeoutMinutes = value;
	}

	public void setWarnMinutesBeforeMax(Integer value) {
		warnMinutesBeforeMax = value;
	}

	public Integer getMaxInactivityTimeoutMinutes() {
		return maxInactivityTimeoutMinutes;
	}

	public Integer getWarnMinutesBeforeMax() {
		return warnMinutesBeforeMax;
	}

	public void setMeetingExpireWhenLastUserLeftInMinutes(Integer value) {
		meetingExpireWhenLastUserLeftInMinutes = value;
	}

	public Integer getmeetingExpireWhenLastUserLeftInMinutes() {
		return meetingExpireWhenLastUserLeftInMinutes;
	}


	public void setMeetingExpireIfNoUserJoinedInMinutes(Integer value) {
		meetingExpireIfNoUserJoinedInMinutes = value;
	}

	public Integer getMeetingExpireIfNoUserJoinedInMinutes() {
		return meetingExpireIfNoUserJoinedInMinutes;
	}


	public Map<String, Object> getUserCustomData(String userID){
		return (Map<String, Object>) userCustomData.get(userID);
	}

	public void userRegistered(RegisteredUser user) {
        this.registeredUsers.put(user.userId, user);
    }

    public RegisteredUser userUnregistered(String userid) {
		return this.registeredUsers.remove(userid);
    }

    public ConcurrentMap<String, RegisteredUser> getRegisteredUsers() {
        return registeredUsers;
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
    	private boolean autoStartRecording;
        private boolean allowStartStopRecording;
        private boolean webcamsOnlyForModerator;
    	private String moderatorPass;
    	private String viewerPass;
    	private int duration;
    	private String webVoice;
    	private String telVoice;
    	private String welcomeMsgTemplate;
    	private String welcomeMsg;
    	private String logoutUrl;
    	private String bannerColor;
    	private String bannerText;
    	private int logoutTimer;
    	private Map<String, String> metadata;
    	private String dialNumber;
    	private String defaultAvatarURL;
    	private long createdTime;
    	private boolean isBreakout;
    	private String guestPolicy;

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
    	
    	public Builder withAutoStartRecording(boolean start) {
    		this.autoStartRecording = start;
    		return this;
    	}

    	public Builder withAllowStartStopRecording(boolean allow) {
    		this.allowStartStopRecording = allow;
    		return this;
    	}
    	
        public Builder withWebcamsOnlyForModerator(boolean only) {
            this.webcamsOnlyForModerator = only;
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

	    public Builder withWelcomeMessageTemplate(String w) {
            welcomeMsgTemplate = w;
            return this;
        }
           
    	public Builder withDefaultAvatarURL(String w) {
    		defaultAvatarURL = w;
    		return this;
    	}
    	
    	public Builder isBreakout(Boolean b) {
    	  isBreakout = b;
    	  return this;
    	}

    	public Builder withLogoutUrl(String l) {
    		logoutUrl = l;
    		return this;
    	}
    	
    	public Builder withLogoutTimer(int l) {
    		logoutTimer = l;
    		return this;
    	}
    	
    	public Builder withBannerColor(String c) {
    		bannerColor = c;
    		return this;
    	}
    	
    	public Builder withBannerText(String t) {
    		bannerText = t;
    		return this;
    	}
    	
    	public Builder withMetadata(Map<String, String> m) {
    		metadata = m;
    		return this;
    	}

    	public Builder withGuestPolicy(String policy) {
    		guestPolicy = policy;
    		return  this;
		}
    
    	public Meeting build() {
    		return new Meeting(this);
    	}
    }
}
