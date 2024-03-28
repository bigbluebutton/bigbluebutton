package org.bigbluebutton.api2;

import java.util.ArrayList;
import java.util.Map;

import org.bigbluebutton.api.domain.BreakoutRoomsParams;
import org.bigbluebutton.api.domain.LockSettingsParams;
import org.bigbluebutton.api.domain.Group;
import org.bigbluebutton.api.messaging.converters.messages.DestroyMeetingMessage;
import org.bigbluebutton.api.messaging.converters.messages.EndMeetingMessage;
import org.bigbluebutton.api.messaging.converters.messages.PublishedRecordingMessage;
import org.bigbluebutton.api.messaging.converters.messages.UnpublishedRecordingMessage;
import org.bigbluebutton.api.messaging.converters.messages.DeletedRecordingMessage;
import org.bigbluebutton.api.messaging.messages.EndMeetingPrompt;
import org.bigbluebutton.presentation.messages.IDocConversionMsg;

public interface IBbbWebApiGWApp {
  void send(String channel, String message);
  void createMeeting(String meetingID, String externalMeetingID,
                     String parentMeetingID, String meetingName, Boolean recorded,
                     String voiceBridge, Integer duration, Boolean autoStartRecording,
                     Boolean allowStartStopRecording,
                     Boolean recordFullDurationMedia,
                     Boolean webcamsOnlyForModerator,
                     Integer meetingCameraCap,
                     Integer userCameraCap,
                     Integer maxPinnedCameras,
                     String moderatorPass, String viewerPass, String learningDashboardAccessToken, Long createTime,
                     String createDate, Boolean isBreakout, Integer sequence, Boolean freejoin, Map<String, String> metadata,
                     String guestPolicy, Boolean authenticatedGuest, String meetingLayout, String welcomeMsgTemplate, String welcomeMsg, String modOnlyMessage,
                     String dialNumber, Integer maxUsers, Integer maxUserConcurrentAccesses,
                     Integer meetingExpireIfNoUserJoinedInMinutes,
                     Integer meetingExpireWhenLastUserLeftInMinutes,
                     Integer userInactivityInspectTimerInMinutes,
                     Integer userInactivityThresholdInMinutes,
                     Integer userActivitySignResponseDelayInMinutes,
                     Boolean endWhenNoModerator,
                     Integer endWhenNoModeratorDelayInMinutes,
                     Boolean muteOnStart,
                     Boolean allowModsToUnmuteUsers,
                     Boolean allowModsToEjectCameras,
                     Boolean keepEvents,
                     BreakoutRoomsParams breakoutParams,
                     LockSettingsParams lockSettingsParams,
                     Integer html5InstanceId,
                     ArrayList<Group> groups,
                     ArrayList<String> disabledFeatures,
                     Boolean notifyRecordingIsOn,
                     String presentationUploadExternalDescription,
                     String presentationUploadExternalUrl);

  void registerUser(String meetingID, String internalUserId, String fullname, String role,
                    String externUserID, String authToken, String avatarURL,
                    Boolean guest, Boolean authed, String guestStatus, Boolean excludeFromDashboard);
  void guestWaitingLeft(String meetingID, String internalUserId);

  void destroyMeeting(DestroyMeetingMessage msg);
  void endMeeting(EndMeetingMessage msg);
  void sendKeepAlive(String system, Long bbbWebTimestamp, Long akkaAppsTimestamp);
  void publishedRecording(PublishedRecordingMessage msg);
  void unpublishedRecording(UnpublishedRecordingMessage msg);
  void deletedRecording(DeletedRecordingMessage msg);
  void sendDocConversionMsg(IDocConversionMsg msg);
  void endMeetingPrompt(String meetingId);
}
