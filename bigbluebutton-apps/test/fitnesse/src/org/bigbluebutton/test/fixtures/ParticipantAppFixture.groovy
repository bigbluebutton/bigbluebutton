
package org.bigbluebutton.test.fixtures

import fit.Fixture
import org.bigbluebutton.conference.service.participants.ParticipantsApplication
import org.bigbluebutton.conference.RoomsManager

public class ParticipantAppFixture  extends Fixture{
	public static ParticipantsApplication app
	private RoomsManager manager
	public String roomName;

	public ParticipantAppFixture() {
		app = new ParticipantsApplication()
		manager = new RoomsManager()
		app.setRoomsManager(manager)
	}	
}
