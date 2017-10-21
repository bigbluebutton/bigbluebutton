package org.bigbluebutton.freeswitch.voice;

public interface IVoiceConferenceService {
  void voiceConfRecordingStarted(String voiceConfId, String recordStream, Boolean recording, String timestamp);

  void voiceConfRunning(String voiceConfId, Boolean running);

  void userJoinedVoiceConf(String voiceConfId, String voiceUserId, String userId, String callerIdName,
                           String callerIdNum, Boolean muted, Boolean speaking, String avatarURL);

  void userLeftVoiceConf(String voiceConfId, String voiceUserId);

  void userLockedInVoiceConf(String voiceConfId, String voiceUserId, Boolean locked);

  void userMutedInVoiceConf(String voiceConfId, String voiceUserId, Boolean muted);

  void userTalkingInVoiceConf(String voiceConfId, String voiceUserId, Boolean talking);

  void deskShareStarted(String voiceConfId, String callerIdNum, String callerIdName);

  void deskShareEnded(String voiceConfId, String callerIdNum, String callerIdName);

  void deskShareRTMPBroadcastStarted(String room, String streamname, Integer videoWidth, Integer videoHeight, String timestamp);

  void deskShareRTMPBroadcastStopped(String room, String streamname, Integer videoWidth, Integer videoHeight, String timestamp);

}
