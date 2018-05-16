package org.bigbluebutton.voiceconf.messaging;

public interface IMessagingService {
	void validateConnAuthToken(String meetingId, String userId, String authToken, String connId);
	void userConnectedToGlobalAudio(String voiceConf, String callerIdName, String connId);
	void userDisconnectedFromGlobalAudio(String voiceConf, String callerIdName, String connId);
}
