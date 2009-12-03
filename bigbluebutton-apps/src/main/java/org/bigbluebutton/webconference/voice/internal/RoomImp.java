package org.bigbluebutton.webconference.voice.internal;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.bigbluebutton.webconference.voice.Participant;
import org.bigbluebutton.webconference.voice.Room;

import net.jcip.annotations.ThreadSafe;

@ThreadSafe
public class RoomImp implements Room {
	private final String name;
	private final ConcurrentMap<Integer, Participant> participants;
	
	public RoomImp(String name) {
		this.name = name;
		participants = new ConcurrentHashMap<Integer, Participant>();
	}
	
	public String getName() {
		return name;
	}
	
	public int countParticipants() {
		return participants.size();
	}
	
	public Participant getParticipant(Integer id) {
		return participants.get(id);
	}
	
	public Participant add(Participant p) {
		return participants.putIfAbsent(p.getId(), p);
	}
	
	public boolean hasParticipant(Integer id) {
		return participants.containsKey(id);
	}
	
	public void remove(Integer id) {
		Participant p = participants.remove(id);
		if (p != null) p = null;
	}
	
	public ArrayList<Participant> getParticipants() {
		Map<Integer, Participant> p = Collections.unmodifiableMap(participants);
		ArrayList<Participant> pa = new ArrayList<Participant>();
		pa.addAll(p.values());
		return pa;
	}
}
