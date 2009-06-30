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
