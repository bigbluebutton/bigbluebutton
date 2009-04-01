
package org.bigbluebutton.conference

import org.testng.annotations.*
import groovy.mock.interceptor.StubForimport org.testng.Assertimport static org.easymock.EasyMock.*

public class RoomTest{
	Room r
	Participant p1
	IRoomListener mock
	Participant p2
	
	@BeforeMethod
	public void setUp() {
	    r = new Room("test")
	    Map status = new HashMap()
		status.put("raiseHand", false)
		status.put("presenter", false)
		status.put("hasStream", false)
		def key1 = 1
		def key2 = 2
		p1 = new Participant(key1, 'Test User 1', 'MODERATOR', status)
	    p2 = new Participant(key2, 'Test User 2', 'VIEWER', status)
	    mock = createMock(IRoomListener.class)
	}

	@Test
	public void callListenerOnAddParticipantTest() {
		def getNameMethod = {
				'test-room-listener'
		}
		def participantStatusChangeMethod = {
				
		}
		def participantJoinedMethod = {
				Assert.assertEquals(p1, it, "The participant should be the same as the one added.")
		}
		def participantLeftMethod = {
				participantLeft
		}
		def roomListenerMock = [getName:getNameMethod, participantStatusChange:participantStatusChangeMethod,
		                        participantJoined:participantJoinedMethod, participantLeft:participantLeftMethod] as IRoomListener
		r.addRoomListener(roomListenerMock)
	    r.addParticipant(p1)
	}

	@Test
	public void addTwoParticipantsTest() {
	    r.addParticipant(p1)
	    r.addParticipant(p2)
	    Assert.assertEquals(r.getNumberOfParticipants(), 2, "There should be 2 participants.")
	    Map mp = r.getParticipants()
	    Assert.assertEquals(mp.size(), 2, "There should be 2 participants.")
	    Participant ap =  mp.get(new Long(2))
	    Assert.assertNotNull(ap)
	}
	
	@Test
	public void removeParticipantsTest() {
		def getNameMethod = {
				'test-room-listener'
		}
		def participantStatusChangeMethod = {
				
		}
		def participantJoinedMethod = {
				Assert.assertEquals(p1, it, "The participant should be the same as the one added.")
		}
		def participantLeftMethod = {
				Assert.assertEquals(1L, it, "The userid of the participant that left should be 1.")
		}
		def roomListenerMock = [getName:getNameMethod, participantStatusChange:participantStatusChangeMethod,
		                        participantJoined:participantJoinedMethod, participantLeft:participantLeftMethod] as IRoomListener
		/**
		 * Add a participant before we add the listener mock so as not to trigger the
		 * paticipantJoined method failing the test.
		 */ 
		r.addParticipant(p2)
		// Add the listener mock.
		r.addRoomListener(roomListenerMock)
		// Add participant 1 which should call participantJoinedMethod and should pass the assertion.
	    r.addParticipant(p1)
	    
	    Assert.assertEquals(r.getNumberOfParticipants(), 2, "There should be 2 participants.")
	    r.removeParticipant(new Long(1))
	    Assert.assertEquals(r.getNumberOfParticipants(), 1, "There should be 1 participant left.")
	    Map mp = r.getParticipants()
	    Assert.assertEquals(mp.size(), 1, "There should be 1 participant.")
	    Participant ap =  mp.get(new Long(2))
	    Assert.assertNotNull(ap)
	}
	
	@Test
	public void changeParticipantStatusTest() {
		def getNameMethod = {
			'test-room-listener'
		}
		def participantStatusChangeMethod = {userid, status, value ->
			Assert.assertEquals(1L, userid, "The user id should be 1.")
			Assert.assertEquals("presenter", status, "The status should be presenter.")
			Assert.assertTrue(value, "The presenter should be true.")
		}
		def participantJoinedMethod = {
				Assert.assertEquals(p1, it, "The participant should be the same as the one added.")
		}
		def participantLeftMethod = {
				Assert.assertEquals(1L, it, "The userid of the participant that left should be 1.")
		}
		def roomListenerMock = [getName:getNameMethod, participantStatusChange:participantStatusChangeMethod,
		                        participantJoined:participantJoinedMethod, participantLeft:participantLeftMethod] as IRoomListener
		r.addParticipant(p2)
		r.addRoomListener(roomListenerMock)
	    r.addParticipant(p1)	   
	    Assert.assertEquals(r.getNumberOfParticipants(), 2, "There should be 2 participants.")
	    r.changeParticipantStatus(new Long(1), "presenter", true)

	    Map mp = r.getParticipants()
	    Assert.assertEquals(mp.size(), 2, "There should be 2 participants.")
	    Participant ap =  mp.get(new Long(1))
	    Assert.assertNotNull(ap)
	    Assert.assertTrue(ap.status.get("presenter"), "Presenter status for participant should be true")
	}
}
