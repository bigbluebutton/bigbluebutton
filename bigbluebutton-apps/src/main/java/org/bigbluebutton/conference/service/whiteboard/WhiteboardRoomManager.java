/** 
* ===License Header===
*
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
* ===License Header===
*/
package org.bigbluebutton.conference.service.whiteboard;

import java.util.ArrayList;

import org.red5.server.api.IScope;

public class WhiteboardRoomManager {

	private ArrayList<WhiteboardRoom> rooms;
	
	public WhiteboardRoomManager(){
		rooms = new ArrayList<WhiteboardRoom>();
	}
	
	public WhiteboardRoom addRoom(IScope scope){
		WhiteboardRoom newRoom = new WhiteboardRoom(scope);
		rooms.add(newRoom);
		
		return newRoom;
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
