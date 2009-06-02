
package org.bigbluebutton.conference

import org.testng.annotations.*
import org.testng.Assertimport java.lang.UnsupportedOperationException
public class ParticipantTest {
	Participant p
	
	/**
	 * Run setup before each test-method.
	 */
	@BeforeMethod
	public void setUp() {
		Map status = new HashMap()
		status.put("raiseHand", false)
		status.put("presenter", false)
		status.put("hasStream", false)
		p = new Participant(new Long(1), 'Test User', 'MODERATOR', status)
	}

	@Test
	public void getParticipantUseridTest() {
	   Assert.assertTrue(p.userid == 1, "There is exactly one participant in test-room")
	}
	
	@Test
	public void shouldNotBeAbleToModifyStatusTest() {
		Map s = p.status;
		try {
			s.put("test", true)
			fail()
		} catch (UnsupportedOperationException) {
			// s.put should throw Exception
		}
	}

	@Test
	public void testMap() {
		Map t = new HashMap()
		t.put("a",1)
		Assert.assertEquals(t.get("a"), 1, "Should be 1.")
		t.put("a", 2)
		Assert.assertEquals(t.get("a"), 2, "Should now be 2.")
	}
	
	@Test
	public void shouldBeAbleToSetStatusTest() {
		p.setStatus("test", true)
		Map s = p.status
		Assert.assertTrue(s.containsKey("test"), "Status test should be present")
		Assert.assertTrue(s.get("test"), "Status should be true")
	}
	
	@Test
	public void shouldBeAbleToChangeStatusTest() {
		def RAISE = "raiseHand"
		Map s = p.status
		Assert.assertTrue(s.containsKey(RAISE), "Status raiseHand should be present")
		Assert.assertFalse(s.get(RAISE), "Status should be true")
		p.setStatus(RAISE, true)
		s = p.status
		Assert.assertTrue(s.containsKey(RAISE), "Status raiseHand should be present")
		Assert.assertTrue(s.get(RAISE), "Status should be true")
	}
	
	@Test
	public void shouldBeAbleToRemoveStatusTest() {
		def RAISE = "raiseHand"
		Map s = p.status
		Assert.assertTrue(s.containsKey(RAISE), "Status ${RAISE} should be present")
		Assert.assertFalse(s.get(RAISE), "Status ${RAISE} should be false")
		p.removeStatus(RAISE)
		s = p.status
		Assert.assertFalse(s.containsKey(RAISE), "Status ${RAISE} should not be present")
	}
}
