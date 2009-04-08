
package org.bigbluebutton.test.fixtures

import fit.ColumnFixture
import org.bigbluebutton.conference.Room

public class RoomFixtureTest extends ColumnFixture{
	private Room room
	public String roomName;

	public String checkRoomName() {
	    room = new Room(roomName)
	    return room.getName()
	}	
}
