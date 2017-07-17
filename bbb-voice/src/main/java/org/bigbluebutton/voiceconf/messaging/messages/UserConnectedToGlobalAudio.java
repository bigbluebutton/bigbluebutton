package org.bigbluebutton.voiceconf.messaging.messages;

import java.util.HashMap;

import org.bigbluebutton.voiceconf.messaging.Constants;
import org.bigbluebutton.voiceconf.messaging.MessageBuilder;


public class UserConnectedToGlobalAudio {
	public static final String NAME = "UserConnectedToGlobalAudioMsg";

	public final String voiceConf;
	public final String name;
	public final String userId;
  
	public UserConnectedToGlobalAudio(String voiceConf, String userId, String name) {
		this.voiceConf = voiceConf;
		this.userId = userId;
		this.name = name;
	}
	
	public String toJson() {
		HashMap<String, Object> body = new HashMap<String, Object>();
		body.put(Constants.USER_ID, userId);
		body.put(Constants.NAME, name);

		return MessageBuilder.buildJson(NAME, voiceConf, body);
	}
}
