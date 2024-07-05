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

package org.bigbluebutton.api;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.safety.Safelist;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.StringUtils;
import org.bigbluebutton.api.domain.BreakoutRoomsParams;
import org.bigbluebutton.api.domain.LockSettingsParams;
import org.bigbluebutton.api.domain.Meeting;
import org.bigbluebutton.api.domain.Group;
import org.bigbluebutton.api.service.ServiceUtils;
import org.bigbluebutton.api.util.ParamsUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ParamsProcessorUtil {
    private static Logger log = LoggerFactory.getLogger(ParamsProcessorUtil.class);

    private static final String URLDECODER_SEPARATOR=",";
    private static final String FILTERDECODER_SEPARATOR_ELEMENTS=":";
    private static final String FILTERDECODER_SEPARATOR_OPERATORS="\\|";

    private static final String SERVER_URL = "%%SERVERURL%%";
    private static final String DIAL_NUM = "%%DIALNUM%%";
    private static final String CONF_NUM = "%%CONFNUM%%";
    private static final String CONF_NAME = "%%CONFNAME%%";

    private String apiVersion;
    private boolean serviceEnabled = false;
    private String securitySalt;
    private String supportedChecksumAlgorithms;
    private String checksumHash;
    private int defaultMaxUsers = 20;
    private String defaultWelcomeMessage;
    private String defaultWelcomeMessageFooter;
    private String defaultDialAccessNumber;
    private String testVoiceBridge;
    private String testConferenceMock;
    private String defaultLogoutUrl;
    private String defaultServerUrl;
    private int defaultNumDigitsForTelVoice;
    private String defaultHTML5ClientUrl;

    private String apiUrl;
    private String graphqlWebsocketUrl;
    private String graphqlApiUrl;
    private Boolean allowRequestsWithoutSession = false;
    private Integer defaultHttpSessionTimeout = 14400;
    private Boolean useDefaultAvatar = false;
    private String defaultAvatarURL;
    private String defaultGuestPolicy;
    private Boolean authenticatedGuest;
    private Boolean defaultAllowPromoteGuestToModerator;
    private Long waitingGuestUsersTimeout;
    private String defaultMeetingLayout;
    private int defaultMeetingDuration;
    private boolean disableRecordingDefault;
    private boolean autoStartRecording;
    private boolean allowStartStopRecording;
    private boolean recordFullDurationMedia;
    private boolean learningDashboardEnabled = true;
    private int learningDashboardCleanupDelayInMinutes;
    private boolean webcamsOnlyForModerator;
    private Integer defaultMeetingCameraCap = 0;
    private Integer defaultUserCameraCap = 0;
    private Integer defaultMaxPinnedCameras = 3;
    private boolean defaultMuteOnStart = false;
    private boolean defaultAllowModsToUnmuteUsers = false;
    private boolean defaultAllowModsToEjectCameras = false;
    private String defaultDisabledFeatures;
    private boolean defaultNotifyRecordingIsOn = false;
    private boolean defaultKeepEvents = false;
    private Boolean useDefaultLogo;
    private String defaultLogoURL;
    private String defaultPresentationUploadExternalDescription = "";
    private String defaultPresentationUploadExternalUrl = "";

		private boolean defaultBreakoutRoomsEnabled = true;
		private boolean defaultBreakoutRoomsRecord;
        private boolean defaultBreakoutRoomsCaptureSlides = false;
        private boolean defaultBreakoutRoomsCaptureNotes = false;
        private String  defaultBreakoutRoomsCaptureSlidesFilename = CONF_NAME;
        private String  defaultBreakoutRoomsCaptureNotesFilename = CONF_NAME;
		private boolean defaultbreakoutRoomsPrivateChatEnabled;

		private boolean defaultLockSettingsDisableCam;
		private boolean defaultLockSettingsDisableMic;
		private boolean defaultLockSettingsDisablePrivateChat;
		private boolean defaultLockSettingsDisablePublicChat;
		private boolean defaultLockSettingsDisableNotes;
		private boolean defaultLockSettingsHideUserList;
		private boolean defaultLockSettingsLockOnJoin;
		private boolean defaultLockSettingsLockOnJoinConfigurable;
		private boolean defaultLockSettingsHideViewersCursor;
        private boolean defaultLockSettingsHideViewersAnnotation;

    private Long maxPresentationFileUpload = 30000000L; // 30MB

    private Integer clientLogoutTimerInMinutes = 0;
    private Integer defaultMeetingExpireIfNoUserJoinedInMinutes = 5;
    private Integer defaultMeetingExpireWhenLastUserLeftInMinutes = 1;
  	private Integer userInactivityInspectTimerInMinutes = 120;
  	private Integer userInactivityThresholdInMinutes = 30;
    private Integer userActivitySignResponseDelayInMinutes = 5;
    private Boolean defaultAllowDuplicateExtUserid = true;

    private Integer maxUserConcurrentAccesses = 0;
  	private Boolean defaultEndWhenNoModerator = false;
  	private Integer defaultEndWhenNoModeratorDelayInMinutes = 1;

    private String bbbVersion = "";
    private Boolean allowRevealOfBBBVersion = false;
    private Boolean allowOverrideClientSettingsOnCreateCall = false;

  	private String formatConfNum(String s) {
  		if (s.length() > 5) {
  			/* Reverse conference number.
  			* Put a whitespace every third char.
  			* Reverse it again to display it correctly.
  			* Trim leading whitespaces.
  			* */
  			String confNumReversed = new StringBuilder(s).reverse().toString();
  			String confNumSplit = confNumReversed.replaceAll("(.{3})", "$1 ");
  			String confNumL = new StringBuilder(confNumSplit).reverse().toString().trim();
  			return confNumL;
  		}

  		return s;
  	}

    private String substituteKeywords(String message, String dialNumber, String telVoice, String meetingName) {
        String welcomeMessage = message;

        ArrayList<String> keywordList = new ArrayList<>();
        keywordList.add(DIAL_NUM);
        keywordList.add(CONF_NUM);
        keywordList.add(CONF_NAME);
        keywordList.add(SERVER_URL);

        for (String keyword : keywordList) {
            if (keyword.equals(DIAL_NUM)) {
                welcomeMessage = welcomeMessage.replaceAll(
                        Pattern.quote(DIAL_NUM),
                        Matcher.quoteReplacement(dialNumber));
            } else if (keyword.equals(CONF_NUM)) {
                welcomeMessage = welcomeMessage.replaceAll(
                        Pattern.quote(CONF_NUM),
                        Matcher.quoteReplacement(formatConfNum(telVoice)));
            } else if (keyword.equals(CONF_NAME)) {
                welcomeMessage = welcomeMessage.replaceAll(
                        Pattern.quote(CONF_NAME),
                        Matcher.quoteReplacement(ParamsUtil.escapeHTMLTags(meetingName)));
            } else if (keyword.equals(SERVER_URL)) {
                welcomeMessage = welcomeMessage.replaceAll(
                        Pattern.quote(SERVER_URL),
                        Matcher.quoteReplacement(defaultServerUrl));
            }
        }
        return  welcomeMessage;
    }

    public void processRequiredCreateParams(Map<String, String> params, ApiErrors errors) {
        // Do we have a checksum? If not, complain.
        if (StringUtils.isEmpty(params.get(ApiParams.CHECKSUM))) {
            errors.missingParamError(ApiParams.CHECKSUM);
        }

        // Do we have a meeting id? If not, complain.
        if (!StringUtils.isEmpty(params.get(ApiParams.MEETING_ID))) {
            String meetingId = StringUtils.strip(params.get(ApiParams.MEETING_ID));
            if (StringUtils.isEmpty(meetingId)) {
                errors.missingParamError(ApiParams.MEETING_ID);
            } else {
                if (!ParamsUtil.isValidMeetingId(meetingId)) {
                    errors.addError(new String[] { "invalidFormat", "Meeting id contains invalid characters." });
                }
            }
        } else {
            errors.missingParamError(ApiParams.MEETING_ID);
        }
    }

	public Map<String, Object> processUpdateCreateParams(Map<String, String> params) {
		Map<String, Object> newParams = new HashMap<>();

        String[] createParams = { ApiParams.NAME, ApiParams.ATTENDEE_PW, ApiParams.MODERATOR_PW, ApiParams.VOICE_BRIDGE,
                ApiParams.WEB_VOICE, ApiParams.DIAL_NUMBER, ApiParams.LOGOUT_URL, ApiParams.RECORD,
                ApiParams.MAX_PARTICIPANTS, ApiParams.DURATION, ApiParams.WELCOME };

        for (String paramName : createParams) {
            String parameter = params.get(paramName);
            if (!StringUtils.isEmpty(parameter)) {
                newParams.put(paramName, parameter);
            }
        }

	    // Collect metadata for this meeting that the third-party application wants to store if meeting is recorded.
	    Map<String, String> meetingInfo = new HashMap<>();
	    for (Map.Entry<String, String> entry : params.entrySet()) {
	    	if (entry.getKey().contains(ApiParams.META)){
	    		String[] meta = entry.getKey().split("_");
			    if(meta.length == 2){
			    	meetingInfo.put(meta[1], entry.getValue());
			    }
			}
	    }

        if (!meetingInfo.isEmpty()) {
            newParams.put("metadata", meetingInfo);
        }

	    return newParams;
	}

	private static final Pattern META_VAR_PATTERN = Pattern.compile("meta_[a-zA-Z][a-zA-Z0-9-]*$");
	public static Boolean isMetaValid(String param) {
		Matcher metaMatcher = META_VAR_PATTERN.matcher(param);
    if (metaMatcher.matches()) {
    	return true;
    }
		return false;
	}

	public static String removeMetaString(String param) {
		return StringUtils.removeStart(param, "meta_");
	}

    public static Map<String, String> processMetaParam(Map<String, String> params) {
        Map<String, String> metas = new HashMap<>();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (isMetaValid(entry.getKey())) {
                // Need to lowercase to maintain backward compatibility with
                // 0.81
                String metaName = removeMetaString(entry.getKey()).toLowerCase();
                metas.put(metaName, entry.getValue());
            }
        }

        return metas;
    }

		private BreakoutRoomsParams processBreakoutRoomsParams(Map<String, String> params) {
			Boolean breakoutRoomsRecord = defaultBreakoutRoomsRecord;
			String breakoutRoomsRecordParam = params.get(ApiParams.BREAKOUT_ROOMS_RECORD);
			if (!StringUtils.isEmpty(breakoutRoomsRecordParam)) {
				breakoutRoomsRecord = Boolean.parseBoolean(breakoutRoomsRecordParam);
			}

			Boolean breakoutRoomsPrivateChatEnabled =  defaultbreakoutRoomsPrivateChatEnabled;
			String breakoutRoomsPrivateChatEnabledParam = params.get(ApiParams.BREAKOUT_ROOMS_PRIVATE_CHAT_ENABLED);
			if (!StringUtils.isEmpty(breakoutRoomsPrivateChatEnabledParam)) {
				breakoutRoomsPrivateChatEnabled = Boolean.parseBoolean(breakoutRoomsPrivateChatEnabledParam);
			}

            Boolean breakoutRoomsCaptureSlides = defaultBreakoutRoomsCaptureSlides;
            String breakoutRoomsCaptureParam = params.get(ApiParams.BREAKOUT_ROOMS_CAPTURE_SLIDES);
            if (!StringUtils.isEmpty(breakoutRoomsCaptureParam)) {
				breakoutRoomsCaptureSlides = Boolean.parseBoolean(breakoutRoomsCaptureParam);
			}

            Boolean breakoutRoomsCaptureNotes = defaultBreakoutRoomsCaptureNotes;
            String breakoutRoomsCaptureNotesParam = params.get(ApiParams.BREAKOUT_ROOMS_CAPTURE_NOTES);
            if (!StringUtils.isEmpty(breakoutRoomsCaptureNotesParam)) {
				breakoutRoomsCaptureNotes = Boolean.parseBoolean(breakoutRoomsCaptureNotesParam);
			}

            String breakoutRoomsCaptureNotesFilename = defaultBreakoutRoomsCaptureNotesFilename;
            String breakoutRoomsCaptureNotesFilenameParam = params.get(ApiParams.BREAKOUT_ROOMS_CAPTURE_NOTES_FILENAME);
            if (!StringUtils.isEmpty(breakoutRoomsCaptureNotesFilenameParam)) {
                breakoutRoomsCaptureNotesFilename = breakoutRoomsCaptureNotesFilenameParam;
            }

            String breakoutRoomsCaptureSlidesFilename = defaultBreakoutRoomsCaptureSlidesFilename;
            String breakoutRoomsCaptureSlidesFilenameParam = params.get(ApiParams.BREAKOUT_ROOMS_CAPTURE_SLIDES_FILENAME);
            if (!StringUtils.isEmpty(breakoutRoomsCaptureSlidesFilenameParam)) {
                breakoutRoomsCaptureSlidesFilename = breakoutRoomsCaptureSlidesFilenameParam;
            }

			return new BreakoutRoomsParams(breakoutRoomsRecord, breakoutRoomsPrivateChatEnabled, breakoutRoomsCaptureNotes, breakoutRoomsCaptureSlides, breakoutRoomsCaptureNotesFilename, breakoutRoomsCaptureSlidesFilename);
		}

		private LockSettingsParams processLockSettingsParams(Map<String, String> params) {
			Boolean lockSettingsDisableCam = defaultLockSettingsDisableCam;
			String lockSettingsDisableCamParam = params.get(ApiParams.LOCK_SETTINGS_DISABLE_CAM);
			if (!StringUtils.isEmpty(lockSettingsDisableCamParam)) {
				lockSettingsDisableCam = Boolean.parseBoolean(lockSettingsDisableCamParam);
			}

			Boolean lockSettingsDisableMic = defaultLockSettingsDisableMic;
			String lockSettingsDisableMicParam = params.get(ApiParams.LOCK_SETTINGS_DISABLE_MIC);
			if (!StringUtils.isEmpty(lockSettingsDisableMicParam)) {
				lockSettingsDisableMic = Boolean.parseBoolean(lockSettingsDisableMicParam);
			}

			Boolean lockSettingsDisablePrivateChat = defaultLockSettingsDisablePrivateChat;
			String lockSettingsDisablePrivateChatParam = params.get(ApiParams.LOCK_SETTINGS_DISABLE_PRIVATE_CHAT);
			if (!StringUtils.isEmpty(lockSettingsDisablePrivateChatParam)) {
				lockSettingsDisablePrivateChat = Boolean.parseBoolean(lockSettingsDisablePrivateChatParam);
			}

			Boolean lockSettingsDisablePublicChat = defaultLockSettingsDisablePublicChat;
			String lockSettingsDisablePublicChatParam = params.get(ApiParams.LOCK_SETTINGS_DISABLE_PUBLIC_CHAT);
			if (!StringUtils.isEmpty(lockSettingsDisablePublicChatParam)) {
				lockSettingsDisablePublicChat = Boolean.parseBoolean(lockSettingsDisablePublicChatParam);
			}

			Boolean lockSettingsDisableNotes = defaultLockSettingsDisableNotes;
			String lockSettingsDisableNotesParam = params.get(ApiParams.LOCK_SETTINGS_DISABLE_NOTES);
			if (!StringUtils.isEmpty(lockSettingsDisableNotesParam)) {
				lockSettingsDisableNotes = Boolean.parseBoolean(lockSettingsDisableNotesParam);
			} else {
				// To be removed after deprecation period
				lockSettingsDisableNotesParam = params.get(ApiParams.DEPRECATED_LOCK_SETTINGS_DISABLE_NOTES);
				if (!StringUtils.isEmpty(lockSettingsDisableNotesParam)) {
					log.warn("[DEPRECATION] use lockSettingsDisableNotes instead of lockSettingsDisableNote");
					lockSettingsDisableNotes = Boolean.parseBoolean(lockSettingsDisableNotesParam);
				}
			}

			Boolean lockSettingsHideUserList = defaultLockSettingsHideUserList;
			String lockSettingsHideUserListParam = params.get(ApiParams.LOCK_SETTINGS_HIDE_USER_LIST);
			if (!StringUtils.isEmpty(lockSettingsHideUserListParam)) {
				lockSettingsHideUserList = Boolean.parseBoolean(lockSettingsHideUserListParam);
			}

			Boolean lockSettingsLockOnJoin = defaultLockSettingsLockOnJoin;
			String lockSettingsLockOnJoinParam = params.get(ApiParams.LOCK_SETTINGS_LOCK_ON_JOIN);
			if (!StringUtils.isEmpty(lockSettingsLockOnJoinParam)) {
				lockSettingsLockOnJoin = Boolean.parseBoolean(lockSettingsLockOnJoinParam);
			}

			Boolean lockSettingsLockOnJoinConfigurable = defaultLockSettingsLockOnJoinConfigurable;
			String lockSettingsLockOnJoinConfigurableParam = params.get(ApiParams.LOCK_SETTINGS_LOCK_ON_JOIN_CONFIGURABLE);
			if (!StringUtils.isEmpty(lockSettingsLockOnJoinConfigurableParam)) {
				lockSettingsLockOnJoinConfigurable = Boolean.parseBoolean(lockSettingsLockOnJoinConfigurableParam);
			}

			Boolean lockSettingsHideViewersCursor = defaultLockSettingsHideViewersCursor;
			String lockSettingsHideViewersCursorParam = params.get(ApiParams.LOCK_SETTINGS_HIDE_VIEWERS_CURSOR);
			if (!StringUtils.isEmpty(lockSettingsHideViewersCursorParam)) {
                lockSettingsHideViewersCursor = Boolean.parseBoolean(lockSettingsHideViewersCursorParam);
			}

            Boolean lockSettingsHideViewersAnnotation = defaultLockSettingsHideViewersAnnotation;
			String lockSettingsHideViewersAnnotationParam = params.get(ApiParams.LOCK_SETTINGS_HIDE_VIEWERS_ANNOTATION);
			if (!StringUtils.isEmpty(lockSettingsHideViewersAnnotationParam)) {
                lockSettingsHideViewersAnnotation = Boolean.parseBoolean(lockSettingsHideViewersAnnotationParam);
			}

			return new LockSettingsParams(lockSettingsDisableCam,
							lockSettingsDisableMic,
							lockSettingsDisablePrivateChat,
							lockSettingsDisablePublicChat,
							lockSettingsDisableNotes,
							lockSettingsHideUserList,
							lockSettingsLockOnJoin,
							lockSettingsLockOnJoinConfigurable,
                            lockSettingsHideViewersCursor,
                            lockSettingsHideViewersAnnotation);
		}

    private ArrayList<Group> processGroupsParams(Map<String, String> params) {
        ArrayList<Group> groups = new ArrayList<Group>();

        String groupsParam = params.get(ApiParams.GROUPS);
        if (!StringUtils.isEmpty(groupsParam)) {
            JsonElement groupParamsJson = new Gson().fromJson(groupsParam, JsonElement.class);

            if(groupParamsJson != null && groupParamsJson.isJsonArray()) {
                JsonArray groupsJson = groupParamsJson.getAsJsonArray();
                for (JsonElement groupJson : groupsJson) {
                    if(groupJson.isJsonObject()) {
                        JsonObject groupJsonObj = groupJson.getAsJsonObject();
                        if(groupJsonObj.has("id")) {
                            String groupId = groupJsonObj.get("id").getAsString();
                            String groupName = "";
                            if(groupJsonObj.has("name")) {
                                groupName = groupJsonObj.get("name").getAsString();
                            }

                            Vector<String> groupUsers = new Vector<>();
                            if(groupJsonObj.has("roster") && groupJsonObj.get("roster").isJsonArray()) {
                                for (JsonElement userExtId : groupJsonObj.get("roster").getAsJsonArray()) {
                                    groupUsers.add(userExtId.getAsString());
                                }
                            }
                            groups.add(new Group(groupId,groupName,groupUsers));
                        }
                    }
                }
            }
        }

        return groups;
    }

    public Meeting processCreateParams(Map<String, String> params) {

        String meetingName = params.get(ApiParams.NAME);
        if (meetingName == null) {
            meetingName = "";
        }

        meetingName = ParamsUtil.stripControlChars(meetingName);

        String externalMeetingId = params.get(ApiParams.MEETING_ID);

        String viewerPass = processPassword(params.get(ApiParams.ATTENDEE_PW));
        String modPass = processPassword(params.get(ApiParams.MODERATOR_PW));

        // Get the digits for voice conference for users joining through the
        // phone.
        // If none is provided, generate one.
        String telVoice = processTelVoice(params.get(ApiParams.VOICE_BRIDGE));

        // Get the voice conference digits/chars for users joing through VOIP on
        // the client.
        // If none is provided, make it the same as the telVoice. If one has
        // been provided,
        // we expect that the users will be joined in the same voice conference.
        String webVoice = params.get(ApiParams.WEB_VOICE);
        if (StringUtils.isEmpty(webVoice)) {
            webVoice = telVoice;
        }

        // Get all the other relevant parameters and generate defaults if none
        // has been provided.
        String dialNumber = processDialNumber(params.get(ApiParams.DIAL_NUMBER));
        String loginUrl = params.get(ApiParams.LOGIN_URL);
        String logoutUrl = processLogoutUrl(params.get(ApiParams.LOGOUT_URL));
        boolean record = processRecordMeeting(params.get(ApiParams.RECORD));
        int maxUsers = processMaxUser(params.get(ApiParams.MAX_PARTICIPANTS));
        int meetingDuration = processMeetingDuration(params.get(ApiParams.DURATION));
        int logoutTimer = processLogoutTimer(params.get(ApiParams.LOGOUT_TIMER));

        // Banner parameters
        String bannerText = params.get(ApiParams.BANNER_TEXT);
        String bannerColor = params.get(ApiParams.BANNER_COLOR);

        // set is breakout room property
        boolean isBreakout = false;
        if (!StringUtils.isEmpty(params.get(ApiParams.IS_BREAKOUT))) {
            isBreakout = Boolean.valueOf(params.get(ApiParams.IS_BREAKOUT));
        }

        String welcomeMessageTemplate = processWelcomeMessage(params.get(ApiParams.WELCOME), isBreakout);
        String welcomeMessage = substituteKeywords(welcomeMessageTemplate,dialNumber, telVoice, meetingName);
        welcomeMessage = sanitizeHtmlRemovingUnsafeTags(welcomeMessage);
        welcomeMessage = welcomeMessage.replace("href=\"event:", "href=\"");
        welcomeMessage = insertBlankTargetToLinks(welcomeMessage);

        String internalMeetingId = convertToInternalMeetingId(externalMeetingId);

        // Check if this is a test meeting. NOTE: This should not belong here.
        // Extract this out.
        if (isTestMeeting(telVoice)) {
            internalMeetingId = getIntMeetingIdForTestMeeting(telVoice);
        }

        boolean autoStartRec = autoStartRecording;
        if (!StringUtils.isEmpty(params.get(ApiParams.AUTO_START_RECORDING))) {
            try {
                autoStartRec = Boolean.parseBoolean(params
                        .get(ApiParams.AUTO_START_RECORDING));
            } catch (Exception ex) {
                log.warn("Invalid param [autoStartRecording] for meeting=[{}]",
                        internalMeetingId);
            }
        }

        boolean allowStartStoptRec = allowStartStopRecording;
        if (!StringUtils.isEmpty(params.get(ApiParams.ALLOW_START_STOP_RECORDING))) {
            try {
                allowStartStoptRec = Boolean.parseBoolean(params
                        .get(ApiParams.ALLOW_START_STOP_RECORDING));
            } catch (Exception ex) {
                log.warn(
                        "Invalid param [allowStartStopRecording] for meeting=[{}]",
                        internalMeetingId);
            }
        }

        boolean _recordFullDurationMedia = recordFullDurationMedia;
        if (!StringUtils.isEmpty(params.get(ApiParams.RECORD_FULL_DURATION_MEDIA))) {
            try {
                _recordFullDurationMedia = Boolean.parseBoolean(params
                        .get(ApiParams.RECORD_FULL_DURATION_MEDIA));
            } catch (Exception ex) {
                log.warn(
                        "Invalid param [recordFullDurationMedia] for meeting=[{}]",
                        internalMeetingId);
            }
        }

        // Check Disabled Features
        ArrayList<String> listOfDisabledFeatures=new ArrayList(Arrays.asList(defaultDisabledFeatures.split(",")));
        if (!StringUtils.isEmpty(params.get(ApiParams.DISABLED_FEATURES))) {
            String disabledFeaturesParam = params.get(ApiParams.DISABLED_FEATURES);
            listOfDisabledFeatures.addAll(Arrays.asList(disabledFeaturesParam.split(",")));
        }
        listOfDisabledFeatures.removeAll(Arrays.asList("", null));
        listOfDisabledFeatures.replaceAll(String::trim);
        listOfDisabledFeatures = new ArrayList<>(new HashSet<>(listOfDisabledFeatures));

        // Check Disabled Features Exclude list -- passed as a CREATE parameter to cancel the disabling (typically from bbb-web's properties file)
        ArrayList<String> listOfDisabledFeaturesExclude = new ArrayList<>();
        if (!StringUtils.isEmpty(params.get(ApiParams.DISABLED_FEATURES_EXCLUDE))) {
            String disabledFeaturesExcludeParam = params.get(ApiParams.DISABLED_FEATURES_EXCLUDE);
            listOfDisabledFeaturesExclude.addAll(Arrays.asList(disabledFeaturesExcludeParam.split(",")));
            listOfDisabledFeaturesExclude.removeAll(Arrays.asList("", null));
            listOfDisabledFeaturesExclude.replaceAll(String::trim);
            listOfDisabledFeatures.removeAll(Arrays.asList(disabledFeaturesExcludeParam.split(",")));
        }

        // Check if VirtualBackgrounds is disabled
        if (!StringUtils.isEmpty(params.get(ApiParams.VIRTUAL_BACKGROUNDS_DISABLED))) {
            boolean virtualBackgroundsDisabled = Boolean.valueOf(params.get(ApiParams.VIRTUAL_BACKGROUNDS_DISABLED));
            if(virtualBackgroundsDisabled == true && !listOfDisabledFeatures.contains("virtualBackgrounds")) {
                log.warn("[DEPRECATION] use disabledFeatures=virtualBackgrounds instead of virtualBackgroundsDisabled=true");
                listOfDisabledFeatures.add("virtualBackgrounds");
            }
        }

        boolean learningDashboardEn = learningDashboardEnabled;
        if (!StringUtils.isEmpty(params.get(ApiParams.LEARNING_DASHBOARD_ENABLED))) {
            try {
                learningDashboardEn = Boolean.parseBoolean(params.get(ApiParams.LEARNING_DASHBOARD_ENABLED));
            } catch (Exception ex) {
                log.warn("Invalid param [learningDashboardEnabled] for meeting=[{}]",internalMeetingId);
            }
        }
        if(learningDashboardEn == false && !listOfDisabledFeatures.contains("learningDashboard")) {
            log.warn("[DEPRECATION] use disabledFeatures=learningDashboard instead of learningDashboardEnabled=false");
            listOfDisabledFeatures.add("learningDashboard");
        }

        // Learning Dashboard not allowed for Breakout Rooms
        if(isBreakout) {
		listOfDisabledFeatures.add("learningDashboard");
	}

	//Set Learning Dashboard configs
        String learningDashboardAccessToken = "";
	int learningDashboardCleanupMins = 0;
        if(listOfDisabledFeatures.contains("learningDashboard") == false) {
            learningDashboardAccessToken = RandomStringUtils.randomAlphanumeric(12).toLowerCase();

	    learningDashboardCleanupMins = learningDashboardCleanupDelayInMinutes;
            if (!StringUtils.isEmpty(params.get(ApiParams.LEARNING_DASHBOARD_CLEANUP_DELAY_IN_MINUTES))) {
                try {
                    learningDashboardCleanupMins = Integer.parseInt(params
                            .get(ApiParams.LEARNING_DASHBOARD_CLEANUP_DELAY_IN_MINUTES));
                } catch (Exception ex) {
                    log.warn(
                            "Invalid param [learningDashboardCleanupDelayInMinutes] for meeting=[{}]",
                            internalMeetingId);
                }
            }
        }

        Boolean notifyRecordingIsOn = defaultNotifyRecordingIsOn;
        if (!StringUtils.isEmpty(params.get(ApiParams.NOTIFY_RECORDING_IS_ON))) {
            notifyRecordingIsOn = Boolean.parseBoolean(params.get(ApiParams.NOTIFY_RECORDING_IS_ON));
        }

        boolean webcamsOnlyForMod = webcamsOnlyForModerator;
        if (!StringUtils.isEmpty(params.get(ApiParams.WEBCAMS_ONLY_FOR_MODERATOR))) {
            try {
                webcamsOnlyForMod = Boolean.parseBoolean(params
                        .get(ApiParams.WEBCAMS_ONLY_FOR_MODERATOR));
            } catch (Exception ex) {
                log.warn(
                        "Invalid param [webcamsOnlyForModerator] for meeting=[{}]",
                        internalMeetingId);
            }
        }

        Integer meetingCameraCap = defaultMeetingCameraCap;
        if (!StringUtils.isEmpty(params.get(ApiParams.MEETING_CAMERA_CAP))) {
            try {
                Integer meetingCameraCapParam = Integer.parseInt(params.get(ApiParams.MEETING_CAMERA_CAP));
                if (meetingCameraCapParam >= 0) meetingCameraCap = meetingCameraCapParam;
            } catch (NumberFormatException e) {
                log.warn("Invalid param [meetingCameraCap] for meeting=[{}]", internalMeetingId);
            }
        }

        Integer userCameraCap = defaultUserCameraCap;
        if (!StringUtils.isEmpty(params.get(ApiParams.USER_CAMERA_CAP))) {
            try {
                Integer userCameraCapParam = Integer.parseInt(params.get(ApiParams.USER_CAMERA_CAP));
                if (userCameraCapParam >= 0) userCameraCap = userCameraCapParam;
            } catch (NumberFormatException e) {
                log.warn("Invalid param [userCameraCap] for meeting=[{}]", internalMeetingId);
            }
        }

        Integer maxPinnedCameras = defaultMaxPinnedCameras;
        if (!StringUtils.isEmpty(params.get(ApiParams.MAX_PINNED_CAMERAS))) {
          try {
            Integer maxPinnedCamerasParam = Integer.parseInt(params.get(ApiParams.MAX_PINNED_CAMERAS));
            if (maxPinnedCamerasParam > 0) maxPinnedCameras = maxPinnedCamerasParam;
          } catch (NumberFormatException e) {
            log.warn("Invalid param [maxPinnedCameras] for meeting =[{}]", internalMeetingId);
          }
        }

        Integer meetingExpireIfNoUserJoinedInMinutes = defaultMeetingExpireIfNoUserJoinedInMinutes;
        if (!StringUtils.isEmpty(params.get(ApiParams.MEETING_EXPIRE_IF_NO_USER_JOINED_IN_MINUTES))) {
            try {
                meetingExpireIfNoUserJoinedInMinutes = Integer.parseInt(params.get(ApiParams.MEETING_EXPIRE_IF_NO_USER_JOINED_IN_MINUTES));
            } catch (NumberFormatException e) {
                log.warn("Invalid param [meetingExpireIfNoUserJoinedInMinutes] for meeting=[{}]", internalMeetingId);
            }
        }

        Integer meetingExpireWhenLastUserLeftInMinutes = defaultMeetingExpireWhenLastUserLeftInMinutes;
        if (!StringUtils.isEmpty(params.get(ApiParams.MEETING_EXPIRE_WHEN_LAST_USER_LEFT_IN_MINUTES))) {
            try {
                meetingExpireWhenLastUserLeftInMinutes = Integer.parseInt(params.get(ApiParams.MEETING_EXPIRE_WHEN_LAST_USER_LEFT_IN_MINUTES));
            } catch (NumberFormatException e) {
                log.warn("Invalid param [meetingExpireWhenLastUserLeftInMinutes] for meeting=[{}]", internalMeetingId);
            }
        }

        boolean endWhenNoModerator = defaultEndWhenNoModerator;
        if (!StringUtils.isEmpty(params.get(ApiParams.END_WHEN_NO_MODERATOR))) {
          try {
	          endWhenNoModerator = Boolean.parseBoolean(params.get(ApiParams.END_WHEN_NO_MODERATOR));
          } catch (Exception ex) {
            log.warn("Invalid param [endWhenNoModerator] for meeting=[{}]", internalMeetingId);
          }
        }

        int endWhenNoModeratorDelayInMinutes = defaultEndWhenNoModeratorDelayInMinutes;
        if (!StringUtils.isEmpty(params.get(ApiParams.END_WHEN_NO_MODERATOR_DELAY_IN_MINUTES))) {
          try {
              endWhenNoModeratorDelayInMinutes = Integer.parseInt(params.get(ApiParams.END_WHEN_NO_MODERATOR_DELAY_IN_MINUTES));
          } catch (Exception ex) {
            log.warn("Invalid param [endWhenNoModeratorDelayInMinutes] for meeting=[{}]", internalMeetingId);
          }
        }

        String guestPolicy = defaultGuestPolicy;
        if (!StringUtils.isEmpty(params.get(ApiParams.GUEST_POLICY))) {
        	guestPolicy = params.get(ApiParams.GUEST_POLICY);
		    }

        Boolean allowPromoteGuestToModerator = defaultAllowPromoteGuestToModerator;
        if (!StringUtils.isEmpty(params.get(ApiParams.ALLOW_PROMOTE_GUEST_TO_MODERATOR))) {
          allowPromoteGuestToModerator = Boolean.parseBoolean(params.get(ApiParams.ALLOW_PROMOTE_GUEST_TO_MODERATOR));
		    }

        String presentationUploadExternalDescription = defaultPresentationUploadExternalDescription;
        if (!StringUtils.isEmpty(params.get(ApiParams.PRESENTATION_UPLOAD_EXTERNAL_DESCRIPTION))) {
            presentationUploadExternalDescription = params.get(ApiParams.PRESENTATION_UPLOAD_EXTERNAL_DESCRIPTION);
        }

        String presentationUploadExternalUrl = defaultPresentationUploadExternalUrl;
        if (!StringUtils.isEmpty(params.get(ApiParams.PRESENTATION_UPLOAD_EXTERNAL_URL))) {
            presentationUploadExternalUrl = params.get(ApiParams.PRESENTATION_UPLOAD_EXTERNAL_URL);
        }

        String meetingLayout = defaultMeetingLayout;

        ArrayList<Group> groups = processGroupsParams(params);

        if (!StringUtils.isEmpty(params.get(ApiParams.MEETING_LAYOUT))) {
            meetingLayout = params.get(ApiParams.MEETING_LAYOUT);
        }

        Boolean breakoutRoomsEnabled = defaultBreakoutRoomsEnabled;
        String breakoutRoomsEnabledParam = params.get(ApiParams.BREAKOUT_ROOMS_ENABLED);
        if (!StringUtils.isEmpty(breakoutRoomsEnabledParam)) {
            breakoutRoomsEnabled = Boolean.parseBoolean(breakoutRoomsEnabledParam);
        }
        if(breakoutRoomsEnabled == false && !listOfDisabledFeatures.contains("breakoutRooms")) {
            log.warn("[DEPRECATION] use disabledFeatures=breakoutRooms instead of breakoutRoomsEnabled=false");
            listOfDisabledFeatures.add("breakoutRooms");
        }

        BreakoutRoomsParams breakoutParams = processBreakoutRoomsParams(params);
        LockSettingsParams lockSettingsParams = processLockSettingsParams(params);

        // Collect metadata for this meeting that the third-party app wants to
        // store if meeting is recorded.
        Map<String, String> meetingInfo = processMetaParam(params);

        // Create a unique internal id by appending the current time. This way,
        // the 3rd-party
        // app can reuse the external meeting id.
        long createTime = System.currentTimeMillis();
        internalMeetingId = internalMeetingId + "-" + Long.toString(createTime);

        // If this create meeting request is for a breakout room, we just used
        // we need to generate a unique internal and external id and keep
        // tracks of the parent meeting id
        String parentMeetingId = "";
        if (isBreakout) {
            internalMeetingId = params.get(ApiParams.MEETING_ID);
            parentMeetingId = ServiceUtils.findMeetingFromMeetingID(params.get(ApiParams.PARENT_MEETING_ID)).getInternalId();
            // We rebuild the the external meeting using the has of the parent
            // meeting, the shared timestamp and the sequence number
            String timeStamp = StringUtils.substringAfter(internalMeetingId, "-");
            String externalHash = DigestUtils
                    .sha1Hex((parentMeetingId + "-" + timeStamp + "-" + params.get(ApiParams.SEQUENCE)));
            externalMeetingId = externalHash + "-" + timeStamp;
        }

        String avatarURL = useDefaultAvatar ? defaultAvatarURL : "";

        if(defaultAllowDuplicateExtUserid == false) {
            log.warn("[DEPRECATION] use `maxUserConcurrentAccesses=1` instead of `allowDuplicateExtUserid=false`");
            maxUserConcurrentAccesses = 1;
        }

        // Create the meeting with all passed in parameters.
        Meeting meeting = new Meeting.Builder(externalMeetingId,
                internalMeetingId, createTime).withName(meetingName)
                .withMaxUsers(maxUsers).withModeratorPass(modPass)
                .withViewerPass(viewerPass).withRecording(record)
                .withDuration(meetingDuration)
                .withLoginUrl(loginUrl)
                .withLogoutUrl(logoutUrl)
                .withLogoutTimer(logoutTimer)
                .withBannerText(bannerText).withBannerColor(bannerColor)
                .withTelVoice(telVoice).withWebVoice(webVoice)
                .withDialNumber(dialNumber)
                .withDefaultAvatarURL(avatarURL)
                .withAutoStartRecording(autoStartRec)
                .withAllowStartStopRecording(allowStartStoptRec)
                .withRecordFullDurationMedia(_recordFullDurationMedia)
                .withWebcamsOnlyForModerator(webcamsOnlyForMod)
                .withMeetingCameraCap(meetingCameraCap)
                .withUserCameraCap(userCameraCap)
                .withMaxPinnedCameras(maxPinnedCameras)
                .withMetadata(meetingInfo)
                .withWelcomeMessageTemplate(welcomeMessageTemplate)
                .withWelcomeMessage(welcomeMessage)
                .withIsBreakout(isBreakout)
                .withGuestPolicy(guestPolicy)
                .withAuthenticatedGuest(authenticatedGuest)
                .withAllowPromoteGuestToModerator(allowPromoteGuestToModerator)
                .withWaitingGuestUsersTimeout(waitingGuestUsersTimeout)
                .withAllowRequestsWithoutSession(allowRequestsWithoutSession)
                .withMeetingLayout(meetingLayout)
				.withBreakoutRoomsParams(breakoutParams)
				.withLockSettingsParams(lockSettingsParams)
				.withMaxUserConcurrentAccesses(maxUserConcurrentAccesses)
                .withLearningDashboardCleanupDelayInMinutes(learningDashboardCleanupMins)
                .withLearningDashboardAccessToken(learningDashboardAccessToken)
                .withGroups(groups)
                .withDisabledFeatures(listOfDisabledFeatures)
                .withNotifyRecordingIsOn(notifyRecordingIsOn)
                .withPresentationUploadExternalDescription(presentationUploadExternalDescription)
                .withPresentationUploadExternalUrl(presentationUploadExternalUrl)
                .build();

        if (!StringUtils.isEmpty(params.get(ApiParams.MODERATOR_ONLY_MESSAGE))) {
            String moderatorOnlyMessageTemplate = params.get(ApiParams.MODERATOR_ONLY_MESSAGE);
            String welcomeMsgForModerators = substituteKeywords(moderatorOnlyMessageTemplate, dialNumber, telVoice, meetingName);
            welcomeMsgForModerators = sanitizeHtmlRemovingUnsafeTags(welcomeMsgForModerators);
            welcomeMsgForModerators = welcomeMsgForModerators.replace("href=\"event:", "href=\"");
            welcomeMsgForModerators = insertBlankTargetToLinks(welcomeMsgForModerators);

            meeting.setWelcomeMsgForModerators(welcomeMsgForModerators);
        }

        if (!StringUtils.isEmpty(params.get(ApiParams.MEETING_ENDED_CALLBACK_URL))) {
        	String meetingEndedCallbackURL = params.get(ApiParams.MEETING_ENDED_CALLBACK_URL);
        	meeting.setMeetingEndedCallbackURL(meetingEndedCallbackURL);
        }

        meeting.setMeetingExpireIfNoUserJoinedInMinutes(meetingExpireIfNoUserJoinedInMinutes);
		meeting.setMeetingExpireWhenLastUserLeftInMinutes(meetingExpireWhenLastUserLeftInMinutes);
		meeting.setUserInactivityInspectTimerInMinutes(userInactivityInspectTimerInMinutes);
		meeting.setUserActivitySignResponseDelayInMinutes(userActivitySignResponseDelayInMinutes);
		meeting.setUserInactivityThresholdInMinutes(userInactivityThresholdInMinutes);
        meeting.setEndWhenNoModerator(endWhenNoModerator);
        meeting.setEndWhenNoModeratorDelayInMinutes(endWhenNoModeratorDelayInMinutes);

        // Add extra parameters for breakout room
        if (isBreakout) {
            meeting.setSequence(Integer.parseInt(params.get(ApiParams.SEQUENCE)));
            meeting.setFreeJoin(Boolean.parseBoolean(params.get(ApiParams.FREE_JOIN)));
            meeting.setCaptureSlides(Boolean.parseBoolean(params.get(ApiParams.BREAKOUT_ROOMS_CAPTURE_SLIDES)));
            meeting.setCaptureNotes(Boolean.parseBoolean(params.get(ApiParams.BREAKOUT_ROOMS_CAPTURE_NOTES)));
            meeting.setCaptureNotesFilename(params.get(ApiParams.BREAKOUT_ROOMS_CAPTURE_NOTES_FILENAME));
            meeting.setCaptureSlidesFilename(params.get(ApiParams.BREAKOUT_ROOMS_CAPTURE_SLIDES_FILENAME));
            meeting.setParentMeetingId(parentMeetingId);
        }

		if (!StringUtils.isEmpty(params.get(ApiParams.LOGO))) {
			meeting.setCustomLogoURL(params.get(ApiParams.LOGO));
		} else if (this.getUseDefaultLogo()) {
			meeting.setCustomLogoURL(this.getDefaultLogoURL());
		}

		if (!StringUtils.isEmpty(params.get(ApiParams.COPYRIGHT))) {
			meeting.setCustomCopyright(params.get(ApiParams.COPYRIGHT));
		}
		Boolean muteOnStart = defaultMuteOnStart;
		if (!StringUtils.isEmpty(params.get(ApiParams.MUTE_ON_START))) {
        	muteOnStart = Boolean.parseBoolean(params.get(ApiParams.MUTE_ON_START));
        }

		// when a moderator joins in a breakout room only with the audio, and the muteOnStart is set to true,
		// the moderator is unable to unmute himself, because they don't have an icon to do so
		if (isBreakout) {
			muteOnStart = false;
		}

		meeting.setMuteOnStart(muteOnStart);

    Boolean meetingKeepEvents = defaultKeepEvents;
    if (!StringUtils.isEmpty(params.get(ApiParams.MEETING_KEEP_EVENTS))) {
      meetingKeepEvents = Boolean.parseBoolean(params.get(ApiParams.MEETING_KEEP_EVENTS));
    }
    meeting.setMeetingKeepEvents(meetingKeepEvents);

        Boolean allowModsToUnmuteUsers = defaultAllowModsToUnmuteUsers;
        if (!StringUtils.isEmpty(params.get(ApiParams.ALLOW_MODS_TO_UNMUTE_USERS))) {
            allowModsToUnmuteUsers = Boolean.parseBoolean(params.get(ApiParams.ALLOW_MODS_TO_UNMUTE_USERS));
        }
        meeting.setAllowModsToUnmuteUsers(allowModsToUnmuteUsers);

        if (!StringUtils.isEmpty(params.get(ApiParams.ALLOW_REQUESTS_WITHOUT_SESSION))) {
            meeting.setAllowRequestsWithoutSession(Boolean.parseBoolean(params.get(ApiParams.ALLOW_REQUESTS_WITHOUT_SESSION)));
        }

    Boolean allowModsToEjectCameras = defaultAllowModsToEjectCameras;
    if (!StringUtils.isEmpty(params.get(ApiParams.ALLOW_MODS_TO_EJECT_CAMERAS))) {
      allowModsToEjectCameras = Boolean.parseBoolean(params.get(ApiParams.ALLOW_MODS_TO_EJECT_CAMERAS));
    }
    meeting.setAllowModsToEjectCameras(allowModsToEjectCameras);

        return meeting;
    }

	public String getApiVersion() {
		return apiVersion;
	}

	public boolean isServiceEnabled() {
		return serviceEnabled;
	}

	public String getDefaultHTML5ClientUrl() {
		return defaultHTML5ClientUrl;
	}

    public String getGraphqlWebsocketUrl() {
        return graphqlWebsocketUrl;
    }

    public String getGraphqlApiUrl() {
        return graphqlApiUrl;
    }

    public String getApiUrl() {
        return apiUrl;
    }

	public Boolean getUseDefaultLogo() {
		return useDefaultLogo;
	}

	public String getDefaultLogoURL() {
		return defaultLogoURL;
	}

	public Boolean getAllowRequestsWithoutSession() {
		return allowRequestsWithoutSession;
	}

  public Integer getDefaultHttpSessionTimeout() {
    return defaultHttpSessionTimeout;
  }

  public void setDefaultHttpSessionTimeout(Integer value) {
    this.defaultHttpSessionTimeout = value;
  }

	public String getDefaultLogoutUrl() {
		 if ((StringUtils.isEmpty(defaultLogoutUrl)) || "default".equalsIgnoreCase(defaultLogoutUrl)) {
     		return defaultServerUrl;
     	} else {
     		return defaultLogoutUrl;
     	}
	}

  public String getBbbVersion() {
    return bbbVersion;
  }

  public Boolean getAllowRevealOfBBBVersion() {
    return allowRevealOfBBBVersion;
  }

  public Boolean getAllowOverrideClientSettingsOnCreateCall() {
    return allowOverrideClientSettingsOnCreateCall;
  }

    public String processWelcomeMessage(String message, Boolean isBreakout) {
        String welcomeMessage = message;
        if (StringUtils.isEmpty(message)) {
            welcomeMessage = defaultWelcomeMessage;
        }
        if (!StringUtils.isEmpty(defaultWelcomeMessageFooter) && !isBreakout)
            welcomeMessage += "<br><br>" + defaultWelcomeMessageFooter;
        return welcomeMessage;
    }

    public String sanitizeHtmlRemovingUnsafeTags(String original) {
        Safelist safelist = new Safelist()
                .addTags("a", "b", "br", "i", "img", "li", "small", "span", "strong", "u", "ul")
                .addAttributes("a", "href", "target")
                .addAttributes("img", "src", "width", "height")
                .addProtocols("a", "href", "https", "mailto", "tel");

        return Jsoup.clean(original, safelist);
    }

    private static String insertBlankTargetToLinks(String html) {
        Document document = Jsoup.parse(html);
        Elements links = document.select("a[href]");  // Select all <a> elements with an href attribute

        for (Element link : links) {
            link.attr("target", "_blank");  // Set target="_blank" attribute
        }

        return document.body().html();  // Return the modified HTML
    }

	public String convertToInternalMeetingId(String extMeetingId) {
		return DigestUtils.sha1Hex(extMeetingId);
	}

    public String processPassword(String pass) {
        return StringUtils.isEmpty(pass) ? RandomStringUtils.randomAlphanumeric(8) : pass;
    }

    public boolean hasChecksumAndQueryString(String checksum, String queryString) {
		return (! StringUtils.isEmpty(checksum) && StringUtils.isEmpty(queryString));
	}

	public String processTelVoice(String telNum) {
		return StringUtils.isEmpty(telNum) ? RandomStringUtils.randomNumeric(defaultNumDigitsForTelVoice) : telNum;
	}

	public String processDialNumber(String dial) {
		return StringUtils.isEmpty(dial) ? defaultDialAccessNumber : dial;
	}

	public String processLogoutUrl(String logoutUrl) {
		if (StringUtils.isEmpty(logoutUrl)) {
	        if ((StringUtils.isEmpty(defaultLogoutUrl)) || "default".equalsIgnoreCase(defaultLogoutUrl)) {
        		return defaultServerUrl;
        	} else {
        		return defaultLogoutUrl;
        	}
		}

		return logoutUrl;
	}

	public boolean processRecordMeeting(String record) {
		// The administrator has turned off recording for all meetings.
		if (disableRecordingDefault) {
			log.info("Recording is turned OFF by default.");
			return false;
		}

		boolean rec = false;
		if(! StringUtils.isEmpty(record)){
			try {
				rec = Boolean.parseBoolean(record);
			} catch(Exception ex){
				rec = false;
			}
		}

		return rec;
	}

	public int processMaxUser(String maxUsers) {
		int mUsers = -1;

		try {
			mUsers = Integer.parseInt(maxUsers);
		} catch(Exception ex) {
			mUsers = defaultMaxUsers;
		}

		return mUsers;
	}

  public int processMeetingDuration(String duration) {
    int mDuration = -1;

    try {
      mDuration = Integer.parseInt(duration);
    } catch(Exception ex) {
      mDuration = defaultMeetingDuration;
    }

    return mDuration;
  }

	public int processLogoutTimer(String logoutTimer) {
		int mDuration = clientLogoutTimerInMinutes;

		try {
			mDuration = Integer.parseInt(logoutTimer);
		} catch(Exception ex) {
			mDuration = clientLogoutTimerInMinutes;
		}

		return mDuration;
	}

    public boolean isTestMeeting(String telVoice) {
        return ((!StringUtils.isEmpty(telVoice)) && (!StringUtils.isEmpty(testVoiceBridge))
                && (telVoice.equals(testVoiceBridge)));
    }

    public String getIntMeetingIdForTestMeeting(String telVoice) {
        if ((testVoiceBridge != null) && (testVoiceBridge.equals(telVoice))
                && StringUtils.isEmpty(testConferenceMock)) {
            return testConferenceMock;
        }

        return "";
    }

	// Can be removed. Checksum validation is performed by the ChecksumValidator
	public boolean isChecksumSame(String apiCall, String checksum, String queryString) {
		if (StringUtils.isEmpty(securitySalt)) {
			log.warn("Security is disabled in this service. Make sure this is intentional.");
			return true;
		}

		if( queryString == null ) {
		    queryString = "";
		} else {
		    // handle either checksum as first or middle / end parameter
		    // TODO: this is hackish - should be done better
		    queryString = queryString.replace("&checksum=" + checksum, "");
		    queryString = queryString.replace("checksum=" + checksum + "&", "");
		    queryString = queryString.replace("checksum=" + checksum, "");
		}

		log.info("CHECKSUM={} length={}", checksum, checksum.length());

		String data = apiCall + queryString + securitySalt;

		int checksumLength = checksum.length();
        String cs = null;

        switch(checksumLength) {
            case 40:
                if(supportedChecksumAlgorithms.contains("sha1")) {
                    cs = DigestUtils.sha1Hex(data);
                    log.info("SHA1 {}", cs);
                }
                break;
            case 64:
                if(supportedChecksumAlgorithms.contains("sha256")) {
                    cs = DigestUtils.sha256Hex(data);
                    log.info("SHA256 {}", cs);
                }
                break;
            case 96:
                if(supportedChecksumAlgorithms.contains("sha384")) {
                    cs = DigestUtils.sha384Hex(data);
                    log.info("SHA384 {}", cs);
                }
                break;
            case 128:
                if(supportedChecksumAlgorithms.contains("sha512")) {
                    cs = DigestUtils.sha512Hex(data);
                    log.info("SHA512 {}", cs);
                }
                break;
            default:
                log.info("No algorithm could be found that matches the provided checksum length");
        }

		if (cs == null || !cs.equalsIgnoreCase(checksum)) {
			log.info("query string after checksum removed: [{}]", queryString);
			log.info("checksumError: query string checksum failed. our: [{}], client: [{}]", cs, checksum);
			return false;
		}

		return true;
	}

	public boolean isPostChecksumSame(String apiCall, Map<String, String[]> params) {
		if (StringUtils.isEmpty(securitySalt)) {
			log.warn("Security is disabled in this service. Make sure this is intentional.");
			return true;
		}

		StringBuilder csbuf = new StringBuilder();
		csbuf.append(apiCall);

		SortedSet<String> keys = new TreeSet<>(params.keySet());

		boolean first = true;
		String checksum = null;
		for (String key: keys) {
			if (ApiParams.CHECKSUM.equals(key)) {
				// Don't include the "checksum" parameter in the checksum
				checksum = params.get(key)[0];
				continue;
			}

			for (String value: params.get(key)) {
				if (first) {
					first = false;
				} else {
					csbuf.append("&");
				}
				csbuf.append(key);
				csbuf.append("=");
				String encResult;

				encResult = value;

/*****
 * Seems like Grails 2.3.6 decodes the string. So we need to re-encode it.
 * We'll remove this later. richard (aug 5, 2014)
*/				try {
					// we need to re-encode the values because Grails unencoded it
					// when it received the 'POST'ed data. Might not need to do in a GET request.
					encResult = URLEncoder.encode(value, StandardCharsets.UTF_8.name());
				} catch (UnsupportedEncodingException e) {
					encResult = value;
				}

				csbuf.append(encResult);
			}
		}
		csbuf.append(securitySalt);

		String baseString = csbuf.toString();
		String cs = DigestUtils.sha1Hex(baseString);

		if (cs == null || !cs.equalsIgnoreCase(checksum)) {
			log.info("POST basestring = {}", baseString);
			log.info("checksumError: failed checksum. our checksum: [{}], client: [{}]", cs, checksum);
			return false;
		}

		return true;
	}

    public boolean parentMeetingExists(String parentMeetingId) {
        Meeting meeting = ServiceUtils.findMeetingFromMeetingID(parentMeetingId);
        return meeting != null;
    }

	/*************************************************
	 * Setters
	 ************************************************/

	public void setApiVersion(String apiVersion) {
		this.apiVersion = apiVersion;
	}

	public void setServiceEnabled(boolean e) {
		serviceEnabled = e;
	}

	public void setSecuritySalt(String securitySalt) {
		this.securitySalt = securitySalt;
	}

    public void setSupportedChecksumAlgorithms(String supportedChecksumAlgorithms) { this.supportedChecksumAlgorithms = supportedChecksumAlgorithms; }

	public void setChecksumHash(String checksumHash) { this.checksumHash = checksumHash; }

	public void setDefaultMaxUsers(int defaultMaxUsers) {
		this.defaultMaxUsers = defaultMaxUsers;
	}

	public void setDefaultWelcomeMessage(String defaultWelcomeMessage) {
		this.defaultWelcomeMessage = defaultWelcomeMessage;
	}

	public void setDefaultWelcomeMessageFooter(String defaultWelcomeMessageFooter) {
	    this.defaultWelcomeMessageFooter = defaultWelcomeMessageFooter;
	}

	public void setDefaultDialAccessNumber(String defaultDialAccessNumber) {
		this.defaultDialAccessNumber = defaultDialAccessNumber;
	}

	public void setTestVoiceBridge(String testVoiceBridge) {
		this.testVoiceBridge = testVoiceBridge;
	}

	public void setTestConferenceMock(String testConferenceMock) {
		this.testConferenceMock = testConferenceMock;
	}

	public void setDefaultLogoutUrl(String defaultLogoutUrl) {
		this.defaultLogoutUrl = defaultLogoutUrl;
	}

	public void setDefaultServerUrl(String defaultServerUrl) {
		this.defaultServerUrl = defaultServerUrl;
	}

	public void setDefaultNumDigitsForTelVoice(int defaultNumDigitsForTelVoice) {
		this.defaultNumDigitsForTelVoice = defaultNumDigitsForTelVoice;
	}

	public void setDefaultHTML5ClientUrl(String defaultHTML5ClientUrl) {
		this.defaultHTML5ClientUrl = defaultHTML5ClientUrl;
	}

    public void setGraphqlWebsocketUrl(String graphqlWebsocketUrl) {
        this.graphqlWebsocketUrl = graphqlWebsocketUrl.replace("https://","wss://");
    }

    public void setGraphqlApiUrl(String graphqlApiUrl) {
        this.graphqlApiUrl = graphqlApiUrl;
    }

    public void setApiUrl(String apiUrl) {
        this.apiUrl = apiUrl;
    }

	public void setUseDefaultLogo(Boolean value) {
		this.useDefaultLogo = value;
	}

	public void setDefaultLogoURL(String url) {
		this.defaultLogoURL = url;
	}

	public void setAllowRequestsWithoutSession(Boolean allowRequestsWithoutSession) {
		this.allowRequestsWithoutSession = allowRequestsWithoutSession;
	}

	public void setDefaultMeetingDuration(int defaultMeetingDuration) {
		this.defaultMeetingDuration = defaultMeetingDuration;
	}

	public void setDisableRecordingDefault(boolean disabled) {
		this.disableRecordingDefault = disabled;
	}

	public void setAutoStartRecording(boolean start) {
		this.autoStartRecording = start;
	}

    public void setAllowStartStopRecording(boolean allowStartStopRecording) {
        this.allowStartStopRecording = allowStartStopRecording;
    }

    public void setRecordFullDurationMedia(boolean recordFullDurationMedia) {
        this.recordFullDurationMedia = recordFullDurationMedia;
    }

    public void setLearningDashboardEnabled(boolean learningDashboardEnabled) {
        this.learningDashboardEnabled = learningDashboardEnabled;
    }

    public void setLearningDashboardCleanupDelayInMinutes(int learningDashboardCleanupDelayInMinutes) {
        this.learningDashboardCleanupDelayInMinutes = learningDashboardCleanupDelayInMinutes;
    }

    public void setWebcamsOnlyForModerator(boolean webcamsOnlyForModerator) {
        this.webcamsOnlyForModerator = webcamsOnlyForModerator;
    }

    public void setDefaultMeetingCameraCap(Integer meetingCameraCap) {
        this.defaultMeetingCameraCap = meetingCameraCap;
    }

    public void setDefaultUserCameraCap(Integer userCameraCap) {
        this.defaultUserCameraCap = userCameraCap;
    }

    public void setDefaultMaxPinnedCameras(Integer maxPinnedCameras) {
        this.defaultMaxPinnedCameras = maxPinnedCameras;
    }

	public void setUseDefaultAvatar(Boolean value) {
		this.useDefaultAvatar = value;
	}

	public void setDefaultAvatarURL(String url) {
		this.defaultAvatarURL = url;
	}

	public void setDefaultGuestPolicy(String guestPolicy) {
		this.defaultGuestPolicy =  guestPolicy;
	}

	public void setAuthenticatedGuest(Boolean value) {
		this.authenticatedGuest = value;
	}

	public void setDefaultAllowPromoteGuestToModerator(Boolean value) {
		this.defaultAllowPromoteGuestToModerator = value;
	}

    public void setWaitingGuestUsersTimeout(Long value) {
        this.waitingGuestUsersTimeout = value;
    }

    public void setDefaultMeetingLayout(String meetingLayout) {
		this.defaultMeetingLayout =  meetingLayout;
	}

	public void setClientLogoutTimerInMinutes(Integer value) {
		clientLogoutTimerInMinutes = value;
	}

	public void setMeetingExpireWhenLastUserLeftInMinutes(Integer value) {
        defaultMeetingExpireWhenLastUserLeftInMinutes = value;
	}

	public void setMeetingExpireIfNoUserJoinedInMinutes(Integer value) {
        defaultMeetingExpireIfNoUserJoinedInMinutes = value;
	}

	public Integer getUserInactivityInspectTimerInMinutes() {
        return userInactivityInspectTimerInMinutes;
    }

    public void setUserInactivityInspectTimerInMinutes(Integer userInactivityInspectTimerInMinutes) {
        this.userInactivityInspectTimerInMinutes = userInactivityInspectTimerInMinutes;
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

	public void setMaxPresentationFileUpload(Long maxFileSize) {
		maxPresentationFileUpload = maxFileSize;
	}

	public Long getMaxPresentationFileUpload() {
		return maxPresentationFileUpload;
	}

	public void setMuteOnStart(Boolean mute) {
		defaultMuteOnStart = mute;
	}

	public Boolean getMuteOnStart() {
		return defaultMuteOnStart;
	}

	public void setDefaultKeepEvents(Boolean mke) {
		defaultKeepEvents = mke;
	}

	public void setAllowModsToUnmuteUsers(Boolean value) {
		defaultAllowModsToUnmuteUsers = value;
	}

	public Boolean getAllowModsToUnmuteUsers() {
		return defaultAllowModsToUnmuteUsers;
	}

  public void setAllowModsToEjectCameras(Boolean value) {
    defaultAllowModsToEjectCameras = value;
  }

  public Boolean getAllowModsToEjectCameras() {
    return defaultAllowModsToEjectCameras;
  }

	public List<String> decodeIds(String encodeid) {
		ArrayList<String> ids=new ArrayList<>();
		try {
			ids.addAll(Arrays.asList(URLDecoder.decode(encodeid, StandardCharsets.UTF_8.name()).split(URLDECODER_SEPARATOR)));
		} catch (UnsupportedEncodingException e) {
			log.error("Couldn't decode the IDs");
		}

		return ids;
	}

    public List<String> convertToInternalMeetingId(List<String> extMeetingIds) {
        ArrayList<String> internalMeetingIds = new ArrayList<>();
        for (String extid : extMeetingIds) {
            internalMeetingIds.add(convertToInternalMeetingId(extid));
        }
        return internalMeetingIds;
    }

    public Map<String, String> getUserCustomData(Map<String, String> params) {
        Map<String, String> resp = new HashMap<>();

        for (String key : params.keySet()) {
            if (key.contains("userdata") && key.indexOf("userdata") == 0) {
                String[] userdata = key.split("-");
                if (userdata.length == 2) {
                    log.debug("Got user custom data {} = {}", key, params.get(key));
                    resp.put(userdata[1], params.get(key));
                }
            }
        }

        return resp;
    }

	public Map<String, Map<String, Object>> decodeFilters(String encodedFilters) {
        Map<String, Map<String, Object>> filters = new LinkedHashMap<>();

        try {
            String[] sFilters = encodedFilters.split(URLDECODER_SEPARATOR);
            for( String sFilter: sFilters) {
                String[] filterElements = sFilter.split(FILTERDECODER_SEPARATOR_ELEMENTS, 3);
                Map<String, Object> filter = new LinkedHashMap<>();
                filter.put("op", filterElements[1]);
                String[] fValues = filterElements[2].split(FILTERDECODER_SEPARATOR_OPERATORS);
                filter.put("values", fValues );
                filters.put(filterElements[0], filter);
            }
        } catch (Exception e) {
            log.error("Couldn't decode the filters");
        }

        return filters;
    }

	public void setBreakoutRoomsEnabled(Boolean breakoutRoomsEnabled) {
		this.defaultBreakoutRoomsEnabled = breakoutRoomsEnabled;
	}

	public void setBreakoutRoomsRecord(Boolean breakoutRoomsRecord) {
		this.defaultBreakoutRoomsRecord = breakoutRoomsRecord;
	}

	public void setBreakoutRoomsPrivateChatEnabled(Boolean breakoutRoomsPrivateChatEnabled) {
		this.defaultbreakoutRoomsPrivateChatEnabled = breakoutRoomsPrivateChatEnabled;
	}

	public void setLockSettingsDisableCam(Boolean lockSettingsDisableCam) {
		this.defaultLockSettingsDisableCam = lockSettingsDisableCam;
	}

	public void setLockSettingsDisableMic(Boolean lockSettingsDisableMic) {
		this.defaultLockSettingsDisableMic = lockSettingsDisableMic;
	}

	public void setLockSettingsDisablePrivateChat(Boolean lockSettingsDisablePrivateChat) {
		this.defaultLockSettingsDisablePrivateChat = lockSettingsDisablePrivateChat;
	}

	public void setLockSettingsDisablePublicChat(Boolean lockSettingsDisablePublicChat) {
		this.defaultLockSettingsDisablePublicChat = lockSettingsDisablePublicChat;
	}

	public void setLockSettingsDisableNotes(Boolean lockSettingsDisableNotes) {
		this.defaultLockSettingsDisableNotes = lockSettingsDisableNotes;
	}

	public void setLockSettingsHideUserList(Boolean lockSettingsHideUserList) {
		this.defaultLockSettingsHideUserList = lockSettingsHideUserList;
	}

	public void setLockSettingsLockOnJoin(Boolean lockSettingsLockOnJoin) {
		this.defaultLockSettingsLockOnJoin = lockSettingsLockOnJoin;
	}

	public void setLockSettingsLockOnJoinConfigurable(Boolean lockSettingsLockOnJoinConfigurable) {
		this.defaultLockSettingsLockOnJoinConfigurable = lockSettingsLockOnJoinConfigurable;
	}

	public void setLockSettingsHideViewersCursor(Boolean lockSettingsHideViewersCursor) {
		this.defaultLockSettingsHideViewersCursor = lockSettingsHideViewersCursor;
	}

    public void setLockSettingsHideViewersAnnotation(Boolean lockSettingsHideViewersAnnotation) {
		this.defaultLockSettingsHideViewersAnnotation = lockSettingsHideViewersAnnotation;
	}

	public void setAllowDuplicateExtUserid(Boolean allow) {
		this.defaultAllowDuplicateExtUserid = allow;
	}

    public void setMaxUserConcurrentAccesses(Integer maxUserConcurrentAccesses) {
		this.maxUserConcurrentAccesses = maxUserConcurrentAccesses;
	}

	public void setEndWhenNoModerator(Boolean val) {
		this.defaultEndWhenNoModerator = val;
	}

  public void setEndWhenNoModeratorDelayInMinutes(Integer value) {
      this.defaultEndWhenNoModeratorDelayInMinutes = value;
  }

  public void setDisabledFeatures(String disabledFeatures) {
        this.defaultDisabledFeatures = disabledFeatures;
    }

  public void setNotifyRecordingIsOn(Boolean notifyRecordingIsOn) {
      this.defaultNotifyRecordingIsOn = notifyRecordingIsOn;
  }

  public void setPresentationUploadExternalDescription(String presentationUploadExternalDescription) {
    this.defaultPresentationUploadExternalDescription = presentationUploadExternalDescription;
  }

  public void setPresentationUploadExternalUrl(String presentationUploadExternalUrl) {
    this.defaultPresentationUploadExternalUrl = presentationUploadExternalUrl;
  }

  public void setBbbVersion(String version) {
      this.bbbVersion = this.allowRevealOfBBBVersion ? version : "";
  }

  public void setAllowRevealOfBBBVersion(Boolean allowVersion) {
    this.allowRevealOfBBBVersion = allowVersion;
  }

  public void setAllowOverrideClientSettingsOnCreateCall(Boolean allowOverrideClientSettingsOnCreateCall) {
    this.allowOverrideClientSettingsOnCreateCall = allowOverrideClientSettingsOnCreateCall;
  }

}
