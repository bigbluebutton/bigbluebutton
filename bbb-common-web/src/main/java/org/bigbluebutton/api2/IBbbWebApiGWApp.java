package org.bigbluebutton.api2;

import java.util.Map;

import org.bigbluebutton.api.domain.BreakoutRoomsParams;
import org.bigbluebutton.api.domain.LockSettingsParams;
import org.bigbluebutton.api.messaging.converters.messages.DestroyMeetingMessage;
import org.bigbluebutton.api.messaging.converters.messages.EndMeetingMessage;
import org.bigbluebutton.api.messaging.converters.messages.PublishedRecordingMessage;
import org.bigbluebutton.api.messaging.converters.messages.UnpublishedRecordingMessage;
import org.bigbluebutton.api.messaging.converters.messages.DeletedRecordingMessage;
import org.bigbluebutton.presentation.messages.IDocConversionMsg;

public interface IBbbWebApiGWApp {
  void send(String channel, String message);
  void createMeeting(String meetingID, String externalMeetingID,
                     String parentMeetingID, String meetingName, Boolean recorded,
                     String voiceBridge, Integer duration, Boolean autoStartRecording,
                     Boolean allowStartStopRecording, Boolean webcamsOnlyForModerator,
                     String moderatorPass, String viewerPass, Long createTime,
                     String createDate, Boolean isBreakout, Integer sequence, Boolean freejoin, Map<String, String> metadata,
                     String guestPolicy, String welcomeMsgTemplate, String welcomeMsg, String modOnlyMessage,
                     String dialNumber, Integer maxUsers,
                     Integer maxInactivityTimeoutMinutes, Integer warnMinutesBeforeMax,
                     Integer meetingExpireIfNoUserJoinedInMinutes,
                     Integer meetingExpireWhenLastUserLeftInMinutes,
                     Integer userInactivityInspectTimerInMinutes,
                     Integer userInactivityThresholdInMinutes,
                     Integer userActivitySignResponseDelayInMinutes,
                     Boolean muteOnStart,
                     Boolean allowModsToUnmuteUsers,
                     Boolean keepEvents,
                     BreakoutRoomsParams breakoutParams,
                     LockSettingsParams lockSettingsParams);

  void registerUser(String meetingID, String internalUserId, String fullname, String role,
                    String externUserID, String authToken, String avatarURL,
                    Boolean guest, Boolean authed, String guestStatus);
  void ejectDuplicateUser(String meetingID, String internalUserId, String fullname,
                    String externUserID);

  void destroyMeeting(DestroyMeetingMessage msg);
  void endMeeting(EndMeetingMessage msg);
  void sendKeepAlive(String system, Long timestamp);
  void publishedRecording(PublishedRecordingMessage msg);
  void unpublishedRecording(UnpublishedRecordingMessage msg);
  void deletedRecording(DeletedRecordingMessage msg);
  void sendDocConversionMsg(IDocConversionMsg msg);
}
