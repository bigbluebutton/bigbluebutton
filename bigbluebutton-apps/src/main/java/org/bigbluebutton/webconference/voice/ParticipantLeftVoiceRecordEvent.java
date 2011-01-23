package org.bigbluebutton.webconference.voice;

public class ParticipantLeftVoiceRecordEvent extends AbstractVoiceRecordEvent {
	
	public ParticipantLeftVoiceRecordEvent() {
		super();
		setEvent("ParticipantLeftEvent");
	}
	
	public void setParticipant(String p) {
		eventMap.put("participant", p);
	}
}
