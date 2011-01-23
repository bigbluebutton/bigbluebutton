package org.bigbluebutton.webconference.voice;

public class ParticipantLeftVoiceRecordEvent extends AbstractVoiceRecordEvent {
	/**
	 * Hardcodes the Event Name to "ParticipantLeftEvent"
	 */
	@Override
	public void setEvent(String event) {
		eventMap.put(EVENT, "ParticipantLeftEvent");
	}
	
	public void setParticipant(String p) {
		eventMap.put("participant", p);
	}
}
