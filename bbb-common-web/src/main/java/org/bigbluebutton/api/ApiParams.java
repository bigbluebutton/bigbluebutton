/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2017 BigBlueButton Inc. and by respective authors (see below).
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

public class ApiParams {

    public static final String ALLOW_START_STOP_RECORDING = "allowStartStopRecording";
    public static final String ATTENDEE_PW = "attendeePW";
    public static final String AUTO_START_RECORDING = "autoStartRecording";
    public static final String BANNER_COLOR = "bannerColor";
    public static final String BANNER_TEXT = "bannerText";
    public static final String CHECKSUM = "checksum";
    public static final String COPYRIGHT = "copyright";
    public static final String DIAL_NUMBER = "dialNumber";
    public static final String DURATION = "duration";
    public static final String FREE_JOIN = "freeJoin";
    public static final String FULL_NAME = "fullName";
    public static final String GUEST_POLICY = "guestPolicy";
    public static final String IS_BREAKOUT = "isBreakout";
    public static final String LOGO = "logo";
    public static final String LOGOUT_TIMER = "logoutTimer";
    public static final String LOGOUT_URL = "logoutURL";
    public static final String MAX_PARTICIPANTS = "maxParticipants";
    public static final String MEETING_ID = "meetingID";
    public static final String META = "meta";
    public static final String MODERATOR_ONLY_MESSAGE = "moderatorOnlyMessage";
    public static final String MODERATOR_PW = "moderatorPW";
    public static final String MUTE_ON_START = "muteOnStart";
    public static final String ALLOW_MODS_TO_UNMUTE_USERS = "allowModsToUnmuteUsers";
    public static final String NAME = "name";
    public static final String PARENT_MEETING_ID = "parentMeetingID";
    public static final String PASSWORD = "password";
    public static final String RECORD = "record";
    public static final String RECORD_ID = "recordID";
    public static final String REDIRECT = "redirect";
    public static final String SEQUENCE = "sequence";
    public static final String VOICE_BRIDGE = "voiceBridge";
    public static final String WEB_VOICE = "webVoice";
    public static final String WEBCAMS_ONLY_FOR_MODERATOR = "webcamsOnlyForModerator";
    public static final String WELCOME = "welcome";

    public static final String BREAKOUT_ROOMS_ENABLED = "breakoutRoomsEnabled";
    public static final String BREAKOUT_ROOMS_RECORD = "breakoutRoomsRecord";
    public static final String BREAKOUT_ROOMS_PRIVATE_CHAT_ENABLED = "breakoutRoomsPrivateChatEnabled";

    public static final String LOCK_SETTINGS_DISABLE_CAM = "lockSettingsDisableCam";
    public static final String LOCK_SETTINGS_DISABLE_MIC = "lockSettingsDisableMic";
    public static final String LOCK_SETTINGS_DISABLE_PRIVATE_CHAT = "lockSettingsDisablePrivateChat";
    public static final String LOCK_SETTINGS_DISABLE_PUBLIC_CHAT = "lockSettingsDisablePublicChat";
    public static final String LOCK_SETTINGS_DISABLE_NOTE = "lockSettingsDisableNote";
    public static final String LOCK_SETTINGS_HIDE_USER_LIST = "lockSettingsHideUserList";
    public static final String LOCK_SETTINGS_LOCKED_LAYOUT = "lockSettingsLockedLayout";
    public static final String LOCK_SETTINGS_LOCK_ON_JOIN = "lockSettingsLockOnJoin";
    public static final String LOCK_SETTINGS_LOCK_ON_JOIN_CONFIGURABLE = "lockSettingsLockOnJoinConfigurable";

    // New param passed on create call to callback when meeting ends.
    // This is a duplicate of the endCallbackUrl meta param as we want this
    // param to stay on the server and not propagated to client and recordings.
    public static final String MEETING_ENDED_CALLBACK_URL = "meetingEndedURL";

    // Param to end the meeting when there are no moderators after a certain period of time.
    // Needed for classes where teacher gets disconnected and can't get back in. Prevents
    // students from running amok.
    public static final String END_WHEN_NO_MODERATOR = "endWhenNoModerator";

    private ApiParams() {
        throw new IllegalStateException("ApiParams is a utility class. Instanciation is forbidden.");
    }

}
