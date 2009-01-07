package org.bigbluebutton.conference.voice.asterisk;

import org.bigbluebutton.conference.voice.IParticipant;

import junit.framework.TestCase;

public class MeetMeRoomAdapterTest extends TestCase {

	public void testAddingAndGettingAndRemovingParticipant() {
		MeetMeRoomAdapter r = new MeetMeRoomAdapter();
		String id = "testParticipant";
		IParticipant p = new MeetMeUserAdapter();
		p.setId(id);
		r.addParticipant(p);
		assertEquals("Room should have participant", true, r.hasParticipant(id));
//		Participant p1 = r.getParticipant(id);
//		assertEquals("Room should get participant", p1.getId(), id);
		r.removeParticipant(id);
		assertEquals("There should be no more participant", false, r.hasParticipant(id));
	}
}
