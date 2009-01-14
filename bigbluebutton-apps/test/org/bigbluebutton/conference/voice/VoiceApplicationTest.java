package org.bigbluebutton.conference.voice;

import org.testng.annotations.*;
import static org.easymock.EasyMock.*;

public class VoiceApplicationTest {
	VoiceApplication app;
	private IVoiceConferenceService mock;
	
	@BeforeClass
	public void setUp() {
		mock = createMock(IVoiceConferenceService.class);
		app = new VoiceApplication();
		app.setVoiceService(mock);
	}
	
	@Test
	public void testVoiceServiceStart() {
		mock.start();
		replay(mock);
	}
}
