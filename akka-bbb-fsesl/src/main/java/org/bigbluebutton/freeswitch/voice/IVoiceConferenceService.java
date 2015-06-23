package org.bigbluebutton.freeswitch.voice;

public interface IVoiceConferenceService {
	void voiceConfRecordingStarted(String voiceConfId, String recordStream, Boolean recording, String timestamp);	
	void userJoinedVoiceConf(String voiceConfId, String voiceUserId, String userId, String callerIdName, 
			String callerIdNum, Boolean muted, Boolean speaking);
	void userLeftVoiceConf(String voiceConfId, String voiceUserId);
	void userLockedInVoiceConf(String voiceConfId, String voiceUserId, Boolean locked);
	void userMutedInVoiceConf(String voiceConfId, String voiceUserId, Boolean muted);
	void userTalkingInVoiceConf(String voiceConfId, String voiceUserId, Boolean talking);
	void deskShareStarted(String voiceConfId, String callerIdNum, String callerIdName);
	void deskShareEnded(String voiceConfId, String callerIdNum, String callerIdName);
//	void deskShareViewerJoined(String voiceConfId, String callerIdNum, String callerIdName);
//	void deskShareViewerLeft(String voiceConfId, String callerIdNum, String callerIdName);
//	void deskShareRecording(String room, String recordingFilename, boolean record, String timestamp);
	void deskShareRecordingStarted(String room, String filename, String timestamp);
	void deskShareRecordingStopped(String room, String filename, String timestamp);
	void deskShareRTMPBroadcastStarted(String room, String filename, String timestamp);
	void deskShareRTMPBroadcastStopped(String room, String filename, String timestamp);

}
