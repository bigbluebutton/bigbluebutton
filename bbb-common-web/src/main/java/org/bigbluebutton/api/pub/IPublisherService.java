package org.bigbluebutton.api.pub;

import java.util.Map;
import java.util.Set;

import org.bigbluebutton.web.services.turn.StunServer;
import org.bigbluebutton.web.services.turn.TurnEntry;

public interface IPublisherService {
    void destroyMeeting(String meetingID);
    void createMeeting(String meetingID, String externalMeetingID,
                       String parentMeetingID, String meetingName, Boolean recorded,
                       String voiceBridge, Integer duration, Boolean autoStartRecording,
                       Boolean allowStartStopRecording,
                       Boolean recordFullDurationMedia,
                       Boolean webcamsOnlyForModerator,
                       Integer userCameraCap,
                       String moderatorPass, String viewerPass, Long createTime,
                       String createDate, Boolean isBreakout, Integer sequence,
                       Boolean freeJoin, Map<String, String> metadata, String guestPolicy
                       );
    void endMeeting(String meetingId);
    void send(String channel, String message);
    void registerUser(String meetingID, String internalUserId, String fullname, String role, String externUserID,
                      String authToken, String avatarURL, String webcamBackgroundURL, Boolean guest, Boolean excludeFromDashboard,
                      String enforceLayout, Boolean authed);
    void sendKeepAlive(String system, Long bbbWebTimestamp, Long akkaAppsTimestamp);
    void sendStunTurnInfo(String meetingId, String internalUserId, Set<StunServer> stuns, Set<TurnEntry> turns);
}
