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

package org.bigbluebutton.conference.service.archive.playback

import org.testng.annotations.BeforeMethodimport org.testng.annotations.Testimport org.testng.Assert
public class FileReaderPlaybackPlayerTest{

	def FileReaderPlaybackPlayer fPlayer
	
	@BeforeMethod
	public void setUp() {
		// Lets find the path to test/resources directory
		File f = new File("findPath")
		fPlayer = new FileReaderPlaybackPlayer('test', 'resources')		
		File f2 = new File(f.absolutePath)
		fPlayer.setRecordingsBaseDirectory(f2.parent)
		fPlayer.initialize()
	}

	@Test
	public void getMessageTest() {
		Assert.assertTrue(fPlayer.isReady(), "The player should be ready.")
		Map m = fPlayer.getMessage()
		Assert.assertNotNull(m)
		Assert.assertEquals(m["application"], "PARTICIPANT", "This should be a PARTICIPANT application.")
		Assert.assertTrue(fPlayer.getEventNumber() == 1, "This should be 1 as it got incremented when we called getMessage()")
		fPlayer.reset()
		Assert.assertTrue(fPlayer.getEventNumber() == 0, "This should be 1 as it got incremented when we called getMessage()")
	}	
	
}
