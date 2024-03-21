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
import java.util.concurrent.locks.Lock;
import java.util.stream.Collectors;

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
	private Boolean captureSlides = false;
	private Boolean captureNotes = false;
	private String captureSlidesFilename = "bbb-none";
	private String captureNotesFilename = "bbb-none";
  	private Integer duration = 0;
	private long createdTime = 0;
	private long startTime = 0;
	private long endTime = 0;
	private boolean forciblyEnded = false;
	private String telVoice;
	private String webVoice;
	private String moderatorPass = "";
	private String viewerPass = "";
	private int learningDashboardCleanupDelayInMinutes;
	private String learningDashboardAccessToken;
	private ArrayList<String> disabledFeatures;
	private Boolean notifyRecordingIsOn;
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
	private boolean recordFullDurationMedia = false;
	private boolean haveRecordingMarks = false;
	private boolean webcamsOnlyForModerator = false;
	private Integer meetingCameraCap = 0;
	private Integer userCameraCap = 0;
	private Integer maxPinnedCameras = 0;
	private String dialNumber;
	private String defaultAvatarURL;
	private String guestPolicy = GuestPolicy.ASK_MODERATOR;
	private String guestLobbyMessage = "";
	private Map<String,String> usersWithGuestLobbyMessages;
	private Boolean authenticatedGuest = false;
	private String meetingLayout = MeetingLayout.SMART_LAYOUT;
	private boolean userHasJoined = false;
	private Map<String, String> guestUsersWithPositionInWaitingLine;
	private Map<String, String> metadata;
	private Map<String, Object> userCustomData;
	private final ConcurrentMap<String, User> users;
	private final ConcurrentMap<String, RegisteredUser> registeredUsers;
	private final ConcurrentMap<String, Long> enteredUsers;
	private final Boolean isBreakout;
	private final List<String> breakoutRooms = new ArrayList<>();
	private ArrayList<Group> groups = new ArrayList<Group>();
	private String customLogoURL = "";
	private String customCopyright = "";
	private Boolean muteOnStart = false;
	private Boolean allowModsToUnmuteUsers = false;
	private Boolean allowRequestsWithoutSession = false;
	private Boolean allowModsToEjectCameras = false;
	private Boolean meetingKeepEvents;
	private String presentationUploadExternalDescription;
	private String presentationUploadExternalUrl;

	private Integer meetingExpireIfNoUserJoinedInMinutes = 5;
	private Integer meetingExpireWhenLastUserLeftInMinutes = 1;
	private Integer userInactivityInspectTimerInMinutes = 120;
	private Integer userInactivityThresholdInMinutes = 30;
    private Integer userActivitySignResponseDelayInMinutes = 5;
    private Boolean endWhenNoModerator = false;
    private Integer endWhenNoModeratorDelayInMinutes = 1;

	public final BreakoutRoomsParams breakoutRoomsParams;
	public final LockSettingsParams lockSettingsParams;

	public final Integer maxUserConcurrentAccesses;

	private String meetingEndedCallbackURL = "";

	private Integer html5InstanceId;

    public Meeting(Meeting.Builder builder) {
        name = builder.name;
        extMeetingId = builder.externalId;
        intMeetingId = builder.internalId;
		disabledFeatures = builder.disabledFeatures;
		notifyRecordingIsOn = builder.notifyRecordingIsOn;
		presentationUploadExternalDescription = builder.presentationUploadExternalDescription;
		presentationUploadExternalUrl = builder.presentationUploadExternalUrl;
		if (builder.viewerPass == null){
			viewerPass = "";
		} else {
			viewerPass = builder.viewerPass;
		}
		if (builder.moderatorPass == null){
			moderatorPass = "";
		} else {
			moderatorPass = builder.moderatorPass;
		}
		learningDashboardCleanupDelayInMinutes = builder.learningDashboardCleanupDelayInMinutes;
		learningDashboardAccessToken = builder.learningDashboardAccessToken;
        maxUsers = builder.maxUsers;
        bannerColor = builder.bannerColor;
        bannerText = builder.bannerText;
        logoutUrl = builder.logoutUrl;
        logoutTimer = builder.logoutTimer;
        defaultAvatarURL = builder.defaultAvatarURL;
        record = builder.record;
        autoStartRecording = builder.autoStartRecording;
        allowStartStopRecording = builder.allowStartStopRecording;
        recordFullDurationMedia = builder.recordFullDurationMedia;
        webcamsOnlyForModerator = builder.webcamsOnlyForModerator;
        meetingCameraCap = builder.meetingCameraCap;
        userCameraCap = builder.userCameraCap;
        maxPinnedCameras = builder.maxPinnedCameras;
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
        authenticatedGuest = builder.authenticatedGuest;
		meetingLayout = builder.meetingLayout;
        allowRequestsWithoutSession = builder.allowRequestsWithoutSession;
        breakoutRoomsParams = builder.breakoutRoomsParams;
        lockSettingsParams = builder.lockSettingsParams;
		maxUserConcurrentAccesses = builder.maxUserConcurrentAccesses;
        endWhenNoModerator = builder.endWhenNoModerator;
        endWhenNoModeratorDelayInMinutes = builder.endWhenNoModeratorDelayInMinutes;
        html5InstanceId = builder.html5InstanceId;
		groups = builder.groups;
		guestUsersWithPositionInWaitingLine = new HashMap<>();
        userCustomData = new HashMap<>();
		usersWithGuestLobbyMessages = new HashMap<>();

        users = new ConcurrentHashMap<>();
        registeredUsers = new ConcurrentHashMap<>();
        enteredUsers = new  ConcurrentHashMap<>();
    }

	public void addBreakoutRoom(String meetingId) {
		breakoutRooms.add(meetingId);
	}

	public List<String> getBreakoutRooms() {
		return breakoutRooms;
	}

	public Map<String, String> getMetadata() {
		return metadata;
	}

	public Collection<User> getUsers() {
		return users.isEmpty() ? Collections.<User>emptySet() : Collections.unmodifiableCollection(users.values());
	}

	public Collection<User> getOnlineUsers() {
    	return users.isEmpty() ? Collections.emptySet() : users.values().stream().filter(user -> !user.hasLeft()).collect(Collectors.toSet());
	}

	public ConcurrentMap<String, User> getUsersMap() {
	    return users;
	}

	public Integer countUniqueExtIds() {
		List<String> uniqueExtIds = new ArrayList<>();
		for (User user : users.values()) {
			if(!uniqueExtIds.contains(user.getExternalUserId())) {
				uniqueExtIds.add(user.getExternalUserId());
			}
		}

		return uniqueExtIds.size();
	}

	public List<String> getUsersWithExtId(String externalUserId) {
		List<String> usersWithExtId = new ArrayList<String>();
		for (User user : users.values()) {
			if(user.getExternalUserId().equals(externalUserId)) {
				usersWithExtId.add(user.getInternalUserId());
			}
		}

		return usersWithExtId;
	}

	public void guestIsWaiting(String userId) {
		RegisteredUser ruser = registeredUsers.get(userId);
		if (ruser != null) {
			ruser.updateGuestWaitedOn();
		}
	}

	public void setLeftGuestLobby(String userId, Boolean bool) {
		RegisteredUser ruser = registeredUsers.get(userId);
		if (ruser != null) {
			ruser.setLeftGuestLobby(bool);
		}
	}

	public Boolean didGuestUserLeaveGuestLobby(String userId) {
		RegisteredUser ruser = registeredUsers.get(userId);

		if (ruser != null) {
			return ruser.getLeftGuestLobby();
		}
		return true;
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

	public int getHtml5InstanceId() { return html5InstanceId; }

    public void setHtml5InstanceId(int instanceId) { html5InstanceId = instanceId; }

	public ArrayList<Group> getGroups() { return groups; }

	public void setGroups(ArrayList<Group> groups) { this.groups = groups; }

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

	public Boolean isCaptureSlides() {
        return captureSlides;
    }

	public void setCaptureSlides(Boolean capture) {
		this.captureSlides = captureSlides;
	}

	public Boolean isCaptureNotes() {
        return captureNotes;
    }

	public void setCaptureNotes(Boolean capture) {
		this.captureNotes = captureNotes;
	}

	public void setCaptureNotesFilename(String filename) {
		this.captureNotesFilename = filename;
	}

	public void setCaptureSlidesFilename(String filename) {
		this.captureSlidesFilename = filename;
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

    public void setHaveRecordingMarks(boolean marks) {
        haveRecordingMarks = marks;
    }

    public boolean haveRecordingMarks() {
        return  haveRecordingMarks;
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

	public int getLearningDashboardCleanupDelayInMinutes() {
		return learningDashboardCleanupDelayInMinutes;
	}

	public String getLearningDashboardAccessToken() {
		return learningDashboardAccessToken;
	}

	public ArrayList<String> getDisabledFeatures() {
		return disabledFeatures;
	}

	public Boolean getNotifyRecordingIsOn() {
		return notifyRecordingIsOn;
	}

	public String getPresentationUploadExternalDescription() {
		return presentationUploadExternalDescription;
	}
	public String getPresentationUploadExternalUrl() {
		return presentationUploadExternalUrl;
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

	public void setWaitingPositionsInWaitingQueue(HashMap<String, String> guestUsersWithPositionInWaitingLine) {
		this.guestUsersWithPositionInWaitingLine = guestUsersWithPositionInWaitingLine;
	}

	public String getWaitingPositionsInWaitingQueue(String userId) {
		return guestUsersWithPositionInWaitingLine.get(userId);
	}

	public void setGuestPolicy(String policy) {
		guestPolicy = policy;
	}

	public String getGuestPolicy() {
    	return guestPolicy;
	}

	public void setGuestLobbyMessage(String message) {
		guestLobbyMessage = message;
	}

	public String getGuestLobbyMessage(String guestId) {
		if (usersWithGuestLobbyMessages.containsKey(guestId) && usersWithGuestLobbyMessages.get(guestId) != "") {
			return usersWithGuestLobbyMessages.get(guestId);
		}
		return guestLobbyMessage;
	}

	public void setPrivateGuestLobbyMessage(String guestId, String message) {
		usersWithGuestLobbyMessages.put(guestId, message);
	}

	public void setAuthenticatedGuest(Boolean authGuest) {
		authenticatedGuest = authGuest;
	}

	public Boolean getAuthenticatedGuest() {
		return authenticatedGuest;
	}

	public void setMeetingLayout(String layout) {
		meetingLayout = layout;
	}

	public String getMeetingLayout() {
		return meetingLayout;
	}

	private String getUnauthenticatedGuestStatus(Boolean guest) {
		if (guest) {
			switch(guestPolicy) {
				case GuestPolicy.ALWAYS_ACCEPT:
				case GuestPolicy.ALWAYS_ACCEPT_AUTH:
					return GuestPolicy.ALLOW;
				case GuestPolicy.ASK_MODERATOR:
					return GuestPolicy.WAIT;
				case GuestPolicy.ALWAYS_DENY:
					return GuestPolicy.DENY;
				default:
					return GuestPolicy.DENY;
			}
		} else {
			return GuestPolicy.ALLOW;
		}
	}

	public String calcGuestStatus(String role, Boolean guest, Boolean authned, Boolean guestParamProvided) {
		if (!authenticatedGuest) return getUnauthenticatedGuestStatus(guest);

		// Allow moderators all the time.
		if (ROLE_MODERATOR.equals(role) || (guestParamProvided && !guest)) {
			return GuestPolicy.ALLOW;
		}

		if (GuestPolicy.ALWAYS_ACCEPT.equals(guestPolicy)) {
			return GuestPolicy.ALLOW;
		} else if (GuestPolicy.ALWAYS_DENY.equals(guestPolicy)) {
			return GuestPolicy.DENY;
		} else if (GuestPolicy.ASK_MODERATOR.equals(guestPolicy)) {
			if  (guest || (!ROLE_MODERATOR.equals(role) && authned)) {
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

	public Integer getMaxUserConcurrentAccesses() {
		return maxUserConcurrentAccesses;
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

	public boolean getRecordFullDurationMedia() {
		return recordFullDurationMedia;
	}

    public boolean getWebcamsOnlyForModerator() {
        return webcamsOnlyForModerator;
    }

    public Integer getMeetingCameraCap() {
        return meetingCameraCap;
    }

    public Integer getUserCameraCap() {
        return userCameraCap;
    }

    public Integer getMaxPinnedCameras() {
        return maxPinnedCameras;
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

  public void setMeetingKeepEvents(Boolean mke) {
    meetingKeepEvents = mke;
  }

  public Boolean getMeetingKeepEvents() {
    return meetingKeepEvents;
  }

	public void setAllowModsToUnmuteUsers(Boolean value) {
		allowModsToUnmuteUsers = value;
	}

	public Boolean getAllowModsToUnmuteUsers() {
		return allowModsToUnmuteUsers;
	}

	public void setAllowRequestsWithoutSession(Boolean value) {
		allowRequestsWithoutSession = value;
	}

	public Boolean getAllowRequestsWithoutSession() {
		return allowRequestsWithoutSession;
	}

  public void setAllowModsToEjectCameras(Boolean value) {
    allowModsToEjectCameras = value;
  }

  public Boolean getAllowModsToEjectCameras() {
    return allowModsToEjectCameras;
  }

	public void userJoined(User user) {
		User u = getUserById(user.getInternalUserId());
		if (u != null) {
			u.joined();
		} else {
			if (!userHasJoined) userHasJoined = true;
			this.users.put(user.getInternalUserId(), user);
			// Clean this user up from the entered user's list
			removeEnteredUser(user.getInternalUserId());
		}
	}

	public User userLeft(String userId) {
		User user = getUserById(userId);
		if (user != null) {
			user.left();
		}

		return user;
	}

	public User removeUser(String userId) {
		return this.users.remove(userId);
	}

	public User getUserById(String id){
		return this.users.get(id);
	}

	public int getNumUsers(){
		return this.users.size();
	}

	public int getNumUsersOnline(){
		int countUsersOnline = 0;
		for (User user : this.users.values()) {
			if(!user.hasLeft()) countUsersOnline++;
		}

		return countUsersOnline;
	}

    public int getNumModerators() {
        int sum = 0;
        for (Map.Entry<String, User> entry : users.entrySet()) {
            User u = entry.getValue();
            if (u.isModerator())
                sum++;
        }
        return sum;
    }

	public String getDialNumber() {
		return dialNumber;
	}

    public int getNumListenOnly() {
        int sum = 0;
        for (Map.Entry<String, User> entry : users.entrySet()) {
            User u = entry.getValue();
            if (u.isListeningOnly())
                sum++;
        }
        return sum;
    }

    public int getNumVoiceJoined() {
        int sum = 0;
        for (Map.Entry<String, User> entry : users.entrySet()) {
            User u = entry.getValue();
            if (u.isVoiceJoined())
                sum++;
        }
        return sum;
    }

    public int getNumVideos() {
        int sum = 0;
        for (Map.Entry<String, User> entry : users.entrySet()) {
            User u = entry.getValue();
            sum += u.getStreams().size();
        }
        return sum;
    }

	public void addUserCustomData(String userID, Map<String, String> data) {
		userCustomData.put(userID, data);
	}

	public void setMeetingExpireWhenLastUserLeftInMinutes(Integer value) {
		meetingExpireWhenLastUserLeftInMinutes = value;
	}

	public Integer getMeetingExpireWhenLastUserLeftInMinutes() {
		return meetingExpireWhenLastUserLeftInMinutes;
	}


	public void setMeetingExpireIfNoUserJoinedInMinutes(Integer value) {
		meetingExpireIfNoUserJoinedInMinutes = value;
	}

	public Integer getMeetingExpireIfNoUserJoinedInMinutes() {
		return meetingExpireIfNoUserJoinedInMinutes;
	}

   public Integer getUserInactivityInspectTimerInMinutes() {
        return userInactivityInspectTimerInMinutes;
    }

    public void setUserInactivityInspectTimerInMinutes(Integer userInactivityInjspectTimerInMinutes) {
        this.userInactivityInspectTimerInMinutes = userInactivityInjspectTimerInMinutes;
    }

    public Integer getUserInactivityThresholdInMinutes() {
        return userInactivityThresholdInMinutes;
    }

    public void setUserInactivityThresholdInMinutes(Integer userInactivityThresholdInMinutes) {
        this.userInactivityThresholdInMinutes = userInactivityThresholdInMinutes;
    }

    public Integer getUserActivitySignResponseDelayInMinutes() {
        return userActivitySignResponseDelayInMinutes;
    }

    public void setUserActivitySignResponseDelayInMinutes(Integer userActivitySignResponseDelayInMinutes) {
        this.userActivitySignResponseDelayInMinutes = userActivitySignResponseDelayInMinutes;
    }

	public Boolean getEndWhenNoModerator() {
		return endWhenNoModerator;
	}

	public void setEndWhenNoModerator(Boolean endWhenNoModerator) {
		this.endWhenNoModerator = endWhenNoModerator;
	}

	public Integer getEndWhenNoModeratorDelayInMinutes() {
		return endWhenNoModeratorDelayInMinutes;
	}

	public void setEndWhenNoModeratorDelayInMinutes(Integer endWhenNoModeratorDelayInMinutes) {
		this.endWhenNoModeratorDelayInMinutes = endWhenNoModeratorDelayInMinutes;
	}

    public String getMeetingEndedCallbackURL() {
    	return meetingEndedCallbackURL;
    }

    public void setMeetingEndedCallbackURL(String meetingEndedCallbackURL) {
    	this.meetingEndedCallbackURL = meetingEndedCallbackURL;
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

    public ConcurrentMap<String, Long> getEnteredUsers() {
        return this.enteredUsers;
    }

    public void userEntered(String userId) {
        // Skip if user already joined
        User u = getUserById(userId);
        if (u != null) return;

        if (!enteredUsers.containsKey(userId)) {
            Long time = System.currentTimeMillis();
            this.enteredUsers.put(userId, time);
        }
    }

    public Long removeEnteredUser(String userId) {
        return this.enteredUsers.remove(userId);
    }

    public Long getEnteredUserById(String userId) {
        return this.enteredUsers.get(userId);
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
    	private boolean recordFullDurationMedia;
        private boolean allowStartStopRecording;
        private boolean webcamsOnlyForModerator;
        private Integer meetingCameraCap;
        private Integer userCameraCap;
        private Integer maxPinnedCameras;
    	private String moderatorPass;
    	private String viewerPass;
    	private int learningDashboardCleanupDelayInMinutes;
    	private String learningDashboardAccessToken;
		private ArrayList<String> disabledFeatures;
		private Boolean notifyRecordingIsOn;
		private String presentationUploadExternalDescription;
		private String presentationUploadExternalUrl;
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
    	private Boolean authenticatedGuest;
    	private Boolean allowRequestsWithoutSession;
		private String meetingLayout;
    	private BreakoutRoomsParams breakoutRoomsParams;
    	private LockSettingsParams lockSettingsParams;

		private Integer maxUserConcurrentAccesses;
		private Boolean endWhenNoModerator;
		private Integer endWhenNoModeratorDelayInMinutes;
		private int html5InstanceId;
		private ArrayList<Group> groups;

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

			public Builder withRecordFullDurationMedia(boolean recordFullDurationMedia) {
				this.recordFullDurationMedia = recordFullDurationMedia;
				return this;
			}

        public Builder withWebcamsOnlyForModerator(boolean only) {
            this.webcamsOnlyForModerator = only;
            return this;
        }

        public Builder withMeetingCameraCap(Integer cap) {
            this.meetingCameraCap = cap;
            return this;
        }

        public Builder withUserCameraCap(Integer cap) {
            this.userCameraCap = cap;
            return this;
        }

        public Builder withMaxPinnedCameras(Integer pins) {
            this.maxPinnedCameras = pins;
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

    	public Builder withLearningDashboardCleanupDelayInMinutes(int m) {
	    	this.learningDashboardCleanupDelayInMinutes = m;
	    	return this;
	    }

    	public Builder withLearningDashboardAccessToken(String t) {
	    	this.learningDashboardAccessToken = t;
	    	return this;
	    }

		public Builder withDisabledFeatures(ArrayList<String> list) {
			this.disabledFeatures = list;
			return this;
		}

    	public Builder withNotifyRecordingIsOn(Boolean b) {
	    	this.notifyRecordingIsOn = b;
	    	return this;
	    }

    	public Builder withPresentationUploadExternalDescription(String d) {
	    	this.presentationUploadExternalDescription = d;
	    	return this;
	    }

			public Builder withPresentationUploadExternalUrl(String u) {
	    	this.presentationUploadExternalUrl = u;
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

    	public Builder withAuthenticatedGuest(Boolean authGuest) {
    		authenticatedGuest = authGuest;
    		return this;
    	}

    	public Builder withAllowRequestsWithoutSession(Boolean value) {
    		allowRequestsWithoutSession = value;
    		return this;
    	}

			public Builder withMeetingLayout(String layout) {
				meetingLayout = layout;
				return this;
			}

		public Builder withBreakoutRoomsParams(BreakoutRoomsParams params) {
    		breakoutRoomsParams = params;
    		return this;
		}

		public Builder withLockSettingsParams(LockSettingsParams params) {
    		lockSettingsParams = params;
    		return  this;
		}

		public Builder withMaxUserConcurrentAccesses(Integer maxUserConcurrentAccesses) {
    		this.maxUserConcurrentAccesses = maxUserConcurrentAccesses;
    		return this;
		}

		public Builder withEndWhenNoModerator(Boolean endWhenNoModerator) {
    		this.endWhenNoModerator = endWhenNoModerator;
    		return this;
		}

		public Builder withEndWhenNoModeratorDelayInMinutes(Integer endWhenNoModeratorDelayInMinutes) {
    		this.endWhenNoModeratorDelayInMinutes = endWhenNoModeratorDelayInMinutes;
    		return this;
		}

		public Builder withHTML5InstanceId(int instanceId) {
    		html5InstanceId = instanceId;
    		return this;
		}

		public Builder withGroups(ArrayList<Group> groups) {
			this.groups = groups;
			return this;
		}

		public Meeting build() {
    		return new Meeting(this);
    	}
    }
}
