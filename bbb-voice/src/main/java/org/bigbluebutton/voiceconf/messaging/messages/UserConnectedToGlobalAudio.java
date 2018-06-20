package org.bigbluebutton.voiceconf.messaging.messages;

import java.util.HashMap;

import org.bigbluebutton.voiceconf.messaging.Constants;
import org.bigbluebutton.voiceconf.messaging.MessageBuilder;


public class UserConnectedToGlobalAudio {
	public static final String NAME = "UserConnectedToGlobalAudioMsg";

	public final String voiceConf;
	public final String name;
	public final String userId;
  public final String connId;

	public UserConnectedToGlobalAudio(String voiceConf, String userId, String name, String connId) {
		this.voiceConf = voiceConf;
		this.userId = userId;
		this.name = name;
		this.connId = connId;
	}
	
	public String toJson() {
		HashMap<String, Object> body = new HashMap<String, Object>();
		body.put(Constants.USER_ID, userId);
		body.put(Constants.NAME, name);
		body.put(Constants.CONNID, connId);

		return MessageBuilder.buildJson(NAME, voiceConf, body);
	}
}
