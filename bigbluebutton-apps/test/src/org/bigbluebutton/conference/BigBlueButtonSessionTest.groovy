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
