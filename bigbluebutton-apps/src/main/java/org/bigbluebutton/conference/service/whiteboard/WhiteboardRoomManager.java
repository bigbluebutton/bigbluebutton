package org.bigbluebutton.conference.service.whiteboard;

import java.util.ArrayList;

import org.red5.server.api.IScope;

public class WhiteboardRoomManager {

	private ArrayList<WhiteboardRoom> rooms;
	
	public WhiteboardRoomManager(){
		rooms = new ArrayList<WhiteboardRoom>();
	}
	
	public void addRoom(IScope scope){
		rooms.add(new WhiteboardRoom(scope));
	}
	
	public WhiteboardRoom getRoom(String scopeName){
		for (int i=0; i<rooms.size(); i++){
			if (rooms.get(i).getScope().getName().equals(scopeName)) return rooms.get(i);
		}
		return null;
	}
	
	public void removeRoom(String scopeName){
		for (int i=0; i<rooms.size(); i++){
			if (rooms.get(i).getScope().getName().equals(scopeName)) rooms.remove(i);
		}
	}
}
