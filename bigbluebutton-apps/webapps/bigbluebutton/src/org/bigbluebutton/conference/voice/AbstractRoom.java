package org.bigbluebutton.conference.voice;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import org.red5.server.so.SharedObject;

public abstract class AbstractRoom implements IRoom {
	private Map<String, IParticipant> participants = new HashMap<String, IParticipant>();
	private IVoiceConferenceService voiceService;
	private String roomName;
	
	public void setName(String name) {
		roomName = name;
	}
	
	public String getName() {
		return roomName;
	}
	
	public void addParticipant(IParticipant p) {
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

	public IVoiceConferenceService getVoiceService() {
		return voiceService;
	}

	public void setVoiceService(IVoiceConferenceService voiceService) {
		this.voiceService = voiceService;
	}

	public abstract void lock();
	public abstract void unlock();
	public abstract void mute();
	public abstract void unmute();
	public abstract boolean isMuted();
	public abstract boolean isLocked();
	public abstract Collection<IParticipant> getParticipants();
}
