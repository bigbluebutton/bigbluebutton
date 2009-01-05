package org.bigbluebutton.conference.voice;

import junit.framework.TestCase;

public class RoomTest extends TestCase {

	public void testAddingAndGettingAndRemovingParticipant() {
		Room r = new Room();
		String id = "testParticipant";
		Participant p = new Participant();
		p.setId(id);
		r.addParticipant(p);
		assertEquals("Room should have participant", true, r.hasParticipant(id));
		Participant p1 = r.getParticipant(id);
		assertEquals("Room should get participant", p1.getId(), id);
		r.removeParticipant(id);
		assertEquals("There should be no more participant", false, r.hasParticipant(id));
	}
}
