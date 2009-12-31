package org.bigbluebutton.presentation;

import java.util.HashMap;
import java.util.Map;

public class ConversionUpdateMessage {
	private Map<String, Object> message = new HashMap<String, Object>();
	
	private ConversionUpdateMessage(MessageBuilder builder) {
		message = builder.message;
	}
	
	public Map<String, Object> getMessage() {
		return message;
	}
	
	public static class MessageBuilder {
		private Map<String, Object> message = new HashMap<String, Object>();
		
		public MessageBuilder(UploadedPresentation pres) {
			message.put("conference", pres.getConference());
			message.put("room", pres.getRoom());
			message.put("returnCode", "CONVERT");
			message.put("presentationName", pres.getName());
    	}
		
		public MessageBuilder entry(String key, Object value) {
			message.put(key, value);
			return this;
		}
		
		public MessageBuilder messageKey(String messageKey) {
			message.put("messageKey", messageKey);
			return this;
		}
		
		public MessageBuilder pagesCompleted(int pagesCompleted) {
			message.put("pagesCompleted", pagesCompleted);
			return this;
		}
		
		public MessageBuilder numberOfPages(int numberOfPages) {
			message.put("numberOfPages", numberOfPages);
			return this;
		}
		
		public MessageBuilder maxNumberPages(int maxNumberPages) {
			message.put("maxNumberPages", maxNumberPages);
			return this;
		}
		
		public MessageBuilder slidesInfo(String slidesInfo) {
			message.put("slidesInfo", slidesInfo);
			return this;
		} 
				
		public ConversionUpdateMessage build() {
			return new ConversionUpdateMessage(this);
		}
	}
}
