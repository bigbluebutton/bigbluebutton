package org.bigbluebutton.conference.service.recorder.chat;


public class PublicChatRecordEvent extends AbstractChatRecordEvent {
	private static final String SENDER = "sender";
	private static final String MESSAGE = "message";
	private static final String LOCALE = "locale";
	private static final String COLOR = "color";
	
	public PublicChatRecordEvent() {
		super();
		setEvent("PublicChatEvent");
	}
		
	public void setSender(String sender) {
		eventMap.put(SENDER, sender);
	}
	
	public void setMessage(String message) {
		eventMap.put(MESSAGE, message);
	}
	
	public void setLocale(String locale) {
		eventMap.put(LOCALE, locale);
	}
	
	public void setColor(String color) {
		eventMap.put(COLOR, color);
	}
}
