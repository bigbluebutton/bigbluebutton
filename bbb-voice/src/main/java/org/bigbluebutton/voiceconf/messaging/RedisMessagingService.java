package org.bigbluebutton.voiceconf.messaging;

import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.bigbluebutton.voiceconf.messaging.messages.UserConnectedToGlobalAudio;
import org.bigbluebutton.voiceconf.messaging.messages.UserDisconnectedFromGlobalAudio;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class RedisMessagingService implements IMessagingService {
	private static Logger log = Red5LoggerFactory.getLogger(RedisMessagingService.class, "sip");
	
  private static final Pattern CALLERNAME_PATTERN = Pattern.compile("(.*)-bbbID-(.*)$");
  
	private MessageSender sender;
	
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
