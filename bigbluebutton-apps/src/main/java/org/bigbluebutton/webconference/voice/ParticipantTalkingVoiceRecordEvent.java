package org.bigbluebutton.webconference.voice;

public class ParticipantTalkingVoiceRecordEvent extends AbstractVoiceRecordEvent {
	
	public ParticipantTalkingVoiceRecordEvent() {
		super();
		setEvent("ParticipantTalkingEvent");
	}
		
	public void setParticipant(String p) {
		eventMap.put("participant", p);
	}
	
	public void setTalking(boolean talking) {
		eventMap.put("talking", Boolean.toString(talking));
	}
	
}
