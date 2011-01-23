package org.bigbluebutton.webconference.voice;

public class ParticipantTalkingVoiceRecordEvent extends AbstractVoiceRecordEvent {
	/**
	 * Hardcodes the Event Name to "ParticipantTalkingEvent"
	 */
	@Override
	public void setEvent(String event) {
		eventMap.put(EVENT, "ParticipantTalkingEvent");
	}
	
	public void setParticipant(String p) {
		eventMap.put("participant", p);
	}
	
	public void setTalking(boolean talking) {
		eventMap.put("talking", Boolean.toString(talking));
	}
	
}
