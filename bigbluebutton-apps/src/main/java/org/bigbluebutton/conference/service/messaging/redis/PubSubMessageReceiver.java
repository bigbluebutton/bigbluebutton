package org.bigbluebutton.conference.service.messaging.redis;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.bigbluebutton.conference.service.messaging.MessagingConstants;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

public class PubSubMessageReceiver {

	private Set<MessageHandler> listeners;
	
	public void setApplicationListeners(Set<MessageHandler> listeners) {
		this.listeners = listeners;
	}
	
	public void notifyListeners(String pattern, String channel, String message) {
		for (MessageHandler listener : listeners) {
			listener.handleMessage(pattern, channel, message);
		}		
	}
	
	public void notifyListeners2(String pattern, String channel, String message) {
		Gson gson = new Gson();
		HashMap<String,String> map = gson.fromJson(message, new TypeToken<Map<String, String>>() {}.getType());
		
		if (channel.equalsIgnoreCase(MessagingConstants.SYSTEM_CHANNEL)){
			String meetingId = map.get("meetingId");
			String messageId = map.get("messageId");
			if(messageId != null){
				if(MessagingConstants.END_MEETING_REQUEST_EVENT.equalsIgnoreCase(messageId)){
					for (MessageHandler listener : listeners) {
				//		listener.endMeetingRequest(meetingId);
					}
				}
			}
		} else if (channel.equalsIgnoreCase(MessagingConstants.PRESENTATION_CHANNEL)){
			for (MessageHandler listener : listeners) {
			//	listener.presentationUpdates(map);
			}
		} else if(channel.equalsIgnoreCase(MessagingConstants.POLLING_CHANNEL)){
			String meetingId = map.get("meetingId");
			String messageId = map.get("messageId");
			if (messageId != null){
				if(messageId.equalsIgnoreCase(MessagingConstants.SEND_POLLS_EVENT)){
					String title = map.get("title");
					String question = map.get("question");
					List<String> answers = gson.fromJson((String)map.get("answers"),new TypeToken<List<String>>() {}.getType());
					for (MessageHandler listener: listeners) {
//						listener.storePoll(meetingId, title, question, answers);
					}
				
				}
			}
		}
	}
	
}
