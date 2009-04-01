
package org.bigbluebutton.conference.service.participants

import org.testng.annotations.*
import org.bigbluebutton.conference.RoomsManagerimport org.bigbluebutton.conference.Roomimport org.bigbluebutton.conference.Participantimport org.testng.Assertimport org.bigbluebutton.conference.IRoomListenerimport static org.easymock.EasyMock.*

class ParticipantsApplicationTest {
	RoomsManager rm
	Room r1, r2
	Participant p1, p2
	ParticipantsApplication pa

	@BeforeMethod
	public void setUp() {
		rm = new RoomsManager()
	    r1 = new Room("test-room-1")
		r2 = new Room("test-room-2")
		Map status = new HashMap()
		status.put("raiseHand", false)
		status.put("presenter", false)
		status.put("hasStream", false)
		p1 = new Participant(new Long(1), 'Test User 1', 'MODERATOR', status)
	    p2 = new Participant(new Long(2), 'Test User 2', 'VIEWER', status)
	    pa = new ParticipantsApplication()
	    pa.setRoomsManager(rm)
	}

	public void createAndDestroyRoomTest() {
	    pa.createRoom(r1.name)
	    pa.createRoom(r2.name)
	    Assert.assertTrue(pa.hasRoom(r1.name))
	    pa.destroyRoom(r1.name)
	    Assert.assertFalse(pa.hasRoom(r1.name))
	}
	
	@Test
	public void participantJoinAndLeftTest() {
		pa.createRoom(r1.name)
	    pa.participantJoin(r1.name, p1.userid, p1.name, p1.role, p1.status)
	    Map p = pa.getParticipants(r1.name)
	    Assert.assertEquals(p.size(), 1, "There should be 1 participant.")
	    pa.participantJoin(r1.name, p2.userid, p2.name, p2.role, p2.status)
	    Assert.assertEquals(p.size(), 2, "There should be 2 participant.")
	    pa.participantLeft(r1.name, p1.userid)
	    Assert.assertEquals(p.size(), 1, "There should be 1 participant.")
	}
	
}
