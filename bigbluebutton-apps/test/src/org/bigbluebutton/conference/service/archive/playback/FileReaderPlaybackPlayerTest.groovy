
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
