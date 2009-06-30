/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */

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
