package org.bigbluebutton.freeswitch.voice;

public interface IVoiceConferenceService {
  void voiceUserJoined(String userId, String webUserId, String conference, 
			String callerIdNum, String callerIdName,
			Boolean muted, Boolean speaking);
  void voiceUserLeft(String meetingId, String userId);
  void voiceUserLocked(String meetingId, String userId, Boolean locked);
  void voiceUserMuted(String meetingId, String userId, Boolean muted);
  void voiceUserTalking(String meetingId, String userId, Boolean talking);
  void voiceStartedRecording(String conference, String recordingFile, 
		  String timestamp, Boolean recording);
}
