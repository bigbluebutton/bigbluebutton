package org.bigbluebutton.conference.voice;

import java.util.HashMap;
import java.util.Map;

public class Room {
	private Map<String, Participant> participants = new HashMap<String, Participant>();
	
	public void addParticipant(Participant p) {
		participants.put(p.getId(), p);
	}
	
	public void removeParticipant(String id) {
		participants.remove(id);
	}
	
	public Participant getParticipant(String id) {
		return (Participant) participants.get(id);
	}
	
	public boolean hasParticipant(String id) {
		return participants.containsKey(id);
	}
}
