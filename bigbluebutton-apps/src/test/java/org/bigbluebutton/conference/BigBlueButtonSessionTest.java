package org.bigbluebutton.conference;

import org.testng.annotations.*;
import org.testng.Assert;

public class BigBlueButtonSessionTest {
		private BigBlueButtonSession session;
		
		@BeforeMethod 
		public void setUp() {			
			session = new BigBlueButtonSession("test-session", 1L, "test-user", "MODERATOR", "test-conference", "test-room", "87115", false, "1233");
		}

		@Test
		public void shouldWeWriteAGetterTest() {	
			Assert.assertEquals(session.getUserid(), 1L, "Userid should be 1");
		}
}
