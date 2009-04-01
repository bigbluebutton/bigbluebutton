
package org.bigbluebutton.conference

import org.testng.annotations.*
import org.bigbluebutton.conference.RoomsManager
import org.bigbluebutton.conference.Room
import org.bigbluebutton.conference.Participant
import org.testng.Assert

public class RoomsManagerTest{
	RoomsManager rm
	Room r1, r2
	Participant p1, p2
	Long uid1=1, uid2 = 2
	def rm1="test-room 1", rm2="test-room 2"
	@BeforeTest
	public void setUp() {
	    rm = new RoomsManager()
	    r1 = new Room(rm1)
	    r2 = new Room(rm2)
		Map status = new HashMap()
		status.put("raiseHand", false)
		status.put("presenter", false)
		status.put("hasStream", false)
		p1 = new Participant(uid1, 'Test User 1', 'MODERATOR', status)
	    p2 = new Participant(uid2, 'Test User 1', 'MODERATOR', status)	    
	}

	@Test
	public void addRoomTest() {
		r1.addParticipant(p1)
	    rm.addRoom(r1)
	    rm.addRoom(r2)
	    Assert.assertEquals(rm.numberOfRooms(), 2, "There should be 2 rooms.")
	    Assert.assertTrue(rm.hasRoom(rm1), "There should be a room with name ${rm1}")
	}
	
	@Test
	public void getParticipantsTest() {
		r1.addParticipant(p1)
	    rm.addRoom(r1)
	    r1.addParticipant(p2)
	    Map m = rm.getParticipants(rm1)
	    Assert.assertEquals(m.size(), 2, "There should be 2 participants in the room.")
	}
}
