
package org.bigbluebutton.conference

import org.testng.annotations.BeforeMethodimport org.testng.annotations.Testimport org.testng.Assertpublic class BigBlueButtonSessionTest{
	def session
	
	@BeforeMethod
	public void setUp() {
		session = new BigBlueButtonSession('test-session', 1L, 'test-user', 'MODERATOR', 'test-conference', 'LIVE', 'test-room')
	}

	@Test
	public void shouldWeWriteAGetterTest() {	
		Assert.assertEquals(session.userid, 1L, "Userid should be 1")
		Assert.assertFalse(session.playbackMode(), "Session is in LIVE mode")
	}
}
