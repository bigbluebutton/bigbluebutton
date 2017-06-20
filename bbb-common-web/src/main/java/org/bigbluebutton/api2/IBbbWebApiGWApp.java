package org.bigbluebutton.api2;


import java.util.Map;

public interface IBbbWebApiGWApp {
  void send(String channel, String message);
  void createMeeting(String meetingID, String externalMeetingID,
                     String parentMeetingID, String meetingName, Boolean recorded,
                     String voiceBridge, Integer duration, Boolean autoStartRecording,
                     Boolean allowStartStopRecording, Boolean webcamsOnlyForModerator,
                     String moderatorPass, String viewerPass, Long createTime,
                     String createDate, Boolean isBreakout, Integer sequence, Map<String, String> metadata,
                     String guestPolicy, String welcomeMsgTemplate, String welcomeMsg, String modOnlyMessage,
                     String dialNumber, Integer maxUsers);
  void registerUser(String meetingID, String internalUserId, String fullname, String role,
                    String externUserID, String authToken, String avatarURL, Boolean guest, Boolean authed);
}
