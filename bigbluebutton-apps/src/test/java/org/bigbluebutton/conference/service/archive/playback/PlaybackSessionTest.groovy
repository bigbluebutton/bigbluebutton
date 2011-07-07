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
public class PlaybackSessionTest{
	PlaybackSession session
	
	@BeforeMethod
	public void setUp() {
		session = new PlaybackSession('session-name')
		// Lets find the path to test/resources directory
		File f = new File("findPath")
		def fPlayer = new FileReaderPlaybackPlayer('test', 'resources')		
		File f2 = new File(f.absolutePath)
		fPlayer.setRecordingsBaseDirectory(f2.parent)
		session.setPlaybackPlayer(fPlayer)
	}
	
	@Test
	public void playbackTimeTest() {
		// This test depends on test/resources/recordings.yaml
		session.startPlayback()
		// Here we expect the message ("Initializing") gets sent to the client after 1 sec.
		Assert.assertEquals(session.playbackTime, 1000L, "Playback time should be 1 second.")
		// Call playMessage to "send" the message to the client. This also gets the next message
		// which should be the first entry in recordings.yaml
		session.playMessage()
		// We want the first recorded message to play after 1 second.
		Assert.assertEquals(session.playbackTime, 1000L, "Playback time should be 1 second.")
		// Call playMessage to "send" the fist message to the client. This also gets the next message
		// which should be the second entry in recordings.yaml
		session.playMessage()
		// The second message should be sent after the computed difference between the first message time/date
		// and the second message time/date.
		Assert.assertEquals(session.playbackTime, 10000L, "Playback time should be 10 seconds.")
	}
	
}
