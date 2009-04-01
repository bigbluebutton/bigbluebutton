
package org.bigbluebutton.conference

import fit.ColumnFixture

public class RoomFixtureTest extends ColumnFixture{
	private Room room
	public String roomName;

	public String checkRoomName() {
	    room = new Room(roomName)
	    return room.getName()
	}	
}
