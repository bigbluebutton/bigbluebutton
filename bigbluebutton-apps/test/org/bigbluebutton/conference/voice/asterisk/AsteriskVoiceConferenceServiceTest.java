package org.bigbluebutton.conference.voice.asterisk;

import java.util.Collection;

import org.asteriskjava.live.AsteriskServer;
import org.asteriskjava.live.ManagerCommunicationException;
import org.asteriskjava.live.MeetMeRoom;
import org.bigbluebutton.conference.voice.AbstractRoom;
import org.bigbluebutton.conference.voice.IParticipant;
import org.bigbluebutton.conference.voice.IRoom;
import org.bigbluebutton.conference.voice.IRoomEventListener;
import org.bigbluebutton.conference.voice.RoomManager;
import org.bigbluebutton.conference.voice.TestRoom;
import org.testng.annotations.*;
import static org.easymock.EasyMock.*;
import static org.testng.Assert.*;

public class AsteriskVoiceConferenceServiceTest {

	private AsteriskVoiceConferenceService service;
	private AsteriskServer serverMock;
	private RoomManager roomManager;
	private MeetMeRoom roomMock;
	private IRoom iRoomMock;
	
	@BeforeClass
	public void setUp() {
		iRoomMock = createMock(IRoom.class);
		roomMock = createMock(MeetMeRoom.class);
		serverMock = createMock(AsteriskServer.class);
		service = new AsteriskVoiceConferenceService();
		roomManager = new RoomManager();
		service.setAsteriskServer(serverMock);
		service.setRoomManager(roomManager);
	}
	
	@Test
	public void testGetRoomFromServer() throws ManagerCommunicationException {
		expect(serverMock.getMeetMeRoom("TestRoom")).andReturn(roomMock);
		replay(serverMock);
		service.getRoom("TestRoom");
		verify(serverMock);
	}
	
	@Test
	public void testGetRoomFromManager() {	
		TestRoom t = new TestRoom();
		t.setName("TestRoom");
		roomManager.addRoom(t);			
		IRoom r = service.getRoom("TestRoom");
		assertTrue(r.getName().equals("TestRoom"));
	}
}
