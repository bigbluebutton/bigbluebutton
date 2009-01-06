package org.bigbluebutton.conference.voice;

import java.util.HashMap;
import java.util.Map;

public class RoomManager {
	private Map<String, IRoom> rooms = new HashMap<String, IRoom>();
	
	public void addRoom(IRoom room) {
		rooms.put(room.getName(), room);
	}
	
	public void removeRoom(String name) {
		rooms.remove(name);
	}
	
	public boolean hasRoom(String name) {
		return rooms.containsKey(name);
	}
	
	public IRoom getRoom(String name) {
		return (IRoom) rooms.get(name);
	}
}
