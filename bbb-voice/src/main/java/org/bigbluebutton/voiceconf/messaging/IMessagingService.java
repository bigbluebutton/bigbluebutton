package org.bigbluebutton.voiceconf.messaging;

public interface IMessagingService {
	void userConnectedToGlobalAudio(String voiceConf, String callerIdName);
	void userDisconnectedFromGlobalAudio(String voiceConf, String callerIdName);
}
