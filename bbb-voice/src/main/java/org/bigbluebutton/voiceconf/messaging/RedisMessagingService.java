package org.bigbluebutton.voiceconf.messaging;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.bigbluebutton.common2.msgs.*;
import com.google.gson.Gson;
import org.bigbluebutton.voiceconf.messaging.messages.UserConnectedToGlobalAudio;
import org.bigbluebutton.voiceconf.messaging.messages.UserDisconnectedFromGlobalAudio;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class RedisMessagingService implements IMessagingService {
	private static Logger log = Red5LoggerFactory.getLogger(RedisMessagingService.class, "sip");
	
  private static final Pattern CALLERNAME_PATTERN = Pattern.compile("(.*)-bbbID-(.*)$");
  
	private MessageSender sender;

	private Map<String, Object> buildEnvelope(String name, Map<String, String> routing) {
		Map<String, Object> envelope = new HashMap<String, Object>();
		envelope.put("name", name);
		envelope.put("routing", routing);
		return envelope;
	}

	private Map<String, String> buildRouting() {
		Map<String, String> routing = new HashMap<String, String>();
		routing.put("msgType", "SYSTEM");
		routing.put("sender", "bbb-video");
		return routing;
	}

	public void validateConnAuthToken(String meetingId, String userId, String authToken, String connId) {
		BbbCoreBaseHeader header = new BbbCoreBaseHeader("ValidateConnAuthTokenSysMsg");
		ValidateConnAuthTokenSysMsgBody body = new ValidateConnAuthTokenSysMsgBody(meetingId,
				userId, authToken, connId, "VIDEO");
		ValidateConnAuthTokenSysMsg msg = new ValidateConnAuthTokenSysMsg(header, body);

		Map<String, String> routing = buildRouting();
		Map<String, Object> envelope = buildEnvelope("ValidateConnAuthTokenSysMsg", routing);

		Map<String, Object> fullmsg = new HashMap<String, Object>();
		fullmsg.put("envelope", envelope);
		fullmsg.put("core", msg);

		Gson gson = new Gson();
		String json = gson.toJson(fullmsg);

		sender.send("to-akka-apps-redis-channel", json);
	}

	@Override
	public void userConnectedToGlobalAudio(String voiceConf, String callerIdName) {
		
  	Matcher matcher = CALLERNAME_PATTERN.matcher(callerIdName);
    if (matcher.matches()) {			
	    String userid = matcher.group(1).trim();
	    String name = matcher.group(2).trim();
			String json = new UserConnectedToGlobalAudio(voiceConf, userid, name).toJson();
			sender.send(MessagingConstants.TO_AKKA_APPS_CHANNEL, json);
    } else {
    	log.warn("Invalid calleridname [{}] in userConnectedToGlobalAudio as it does not match pattern (.*)-bbbID-(.*)");
			String json = new UserConnectedToGlobalAudio(voiceConf, callerIdName, callerIdName).toJson();
			sender.send(MessagingConstants.TO_AKKA_APPS_CHANNEL, json);
    }
	}

	@Override
	public void userDisconnectedFromGlobalAudio(String voiceConf, String callerIdName) {
	  	Matcher matcher = CALLERNAME_PATTERN.matcher(callerIdName);
	    if (matcher.matches()) {
		    String userid = matcher.group(1).trim();
		    String name = matcher.group(2).trim();
				String json = new UserDisconnectedFromGlobalAudio(voiceConf, userid, name).toJson();
				sender.send(MessagingConstants.TO_AKKA_APPS_CHANNEL, json);
	    } else {
	    	log.warn("Invalid calleridname [{}] in userDisconnectedFromGlobalAudio as it does not match pattern (.*)-bbbID-(.*)");
				String json = new UserDisconnectedFromGlobalAudio(voiceConf, callerIdName, callerIdName).toJson();
				sender.send(MessagingConstants.TO_AKKA_APPS_CHANNEL, json);
	    }
	}

	public void setRedisMessageSender(MessageSender sender) {
		this.sender = sender;
	}
}
