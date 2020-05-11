package org.bigbluebutton.freeswitch.voice;

import org.bigbluebutton.freeswitch.voice.events.ConfMember;
import org.bigbluebutton.freeswitch.voice.events.ConfRecording;

import java.util.List;
import java.util.Map;

public interface IVoiceConferenceService {
  void voiceConfRecordingStarted(String voiceConfId,
                                 String recordStream,
                                 Boolean recording,
                                 String timestamp);

  void voiceConfRunning(String voiceConfId,
                        Boolean running);

  void userJoinedVoiceConf(String voiceConfId,
                           String voiceUserId,
                           String userId,
                           String callerIdName,
                           String callerIdNum,
                           Boolean muted,
                           Boolean speaking,
                           String avatarURL);

  void voiceUsersStatus(String voiceConfId,
                        java.util.List<ConfMember> confMembers,
                        java.util.List<ConfRecording> confRecordings);

  void userLeftVoiceConf(String voiceConfId,
                         String voiceUserId);

  void userLockedInVoiceConf(String voiceConfId,
                             String voiceUserId,
                             Boolean locked);

  void userMutedInVoiceConf(String voiceConfId,
                            String voiceUserId,
                            Boolean muted);

  void userTalkingInVoiceConf(String voiceConfId,
                              String voiceUserId,
                              Boolean talking);

  void deskShareStarted(String voiceConfId,
                        String callerIdNum,
                        String callerIdName);

  void deskShareEnded(String voiceConfId,
                      String callerIdNum,
                      String callerIdName);

  void deskShareRTMPBroadcastStarted(String room,
                                     String streamname,
                                     Integer videoWidth,
                                     Integer videoHeight,
                                     String timestamp);

  void deskShareRTMPBroadcastStopped(String room,
                                     String streamname,
                                     Integer videoWidth,
                                     Integer videoHeight,
                                     String timestamp);

  void voiceConfRunningAndRecording(String room,
                                    Boolean isRunning,
                                    Boolean isRecording,
                                    java.util.List<ConfRecording> confRecording);

  void voiceCallStateEvent(String conf,
                           String callSession,
                           String clientSession,
                           String userId,
                           String callerName,
                           String callState,
                           String origCallerIdName,
                           String origCalledDest);

  void freeswitchStatusReplyEvent(Long sendCommandTimestamp,
                                  List<String> status,
                                  Long receivedResponseTimestamp);

  void freeswitchHeartbeatEvent(Map<String, String> heartbeat);
}
