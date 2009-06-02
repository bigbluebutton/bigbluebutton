
package org.bigbluebutton.conference.service.archive

import org.testng.annotations.BeforeMethodimport org.testng.annotations.Testimport org.bigbluebutton.conference.service.archive.playback.PlaybackJobSchedulerimport org.bigbluebutton.conference.service.archive.playback.IPlaybackNotifierimport org.testng.Assert
public class ArchiveApplicationTest{
	ArchiveApplication application
	PlaybackJobScheduler scheduler
	String roomDir 
	
	@BeforeMethod
	public void setUp() {
		application = new ArchiveApplication()
		scheduler = new PlaybackJobScheduler()
		scheduler.start()
		application.setPlaybackJobScheduler(scheduler)
		File recordingsDir = new File("test/resources")
		application.setRecordingsDirectory(recordingsDir.canonicalPath)
	}

//	@Test
	public void playSessionTest() {
		/***
		 * In this test, we want to check that the messages are fired in proper timing.
		 * The delay between the first and second message is 1sec while the delay
		 * between second and third message is 10sec.
		 */
		 def messageTime = []
		application.createPlaybackSession('test-conference', 'test-room', 'test-session')
		def sendMessageHandler = {
			 def now = new Date(); println "[$now] - $it"
			 messageTime.add(now.time)
		}
		def participantNotifier = [notifierName:{'PARTICIPANT'}, sendMessage:sendMessageHandler] as IPlaybackNotifier
		def playbackNotifier = [notifierName:{'PLAYBACK'}, sendMessage:sendMessageHandler] as IPlaybackNotifier
		application.addPlaybackNotifier('test-session', participantNotifier)
		application.addPlaybackNotifier('test-session', playbackNotifier)
		application.startPlayback('test-session')
		boolean wait = true
		while (wait) {
			sleep(15000)
			wait = false
		}
		Assert.assertTrue(messageTime.size() == 3, "There should have been 3 messages fired.")
		Assert.assertTrue((messageTime[1] - messageTime[0]) > 1000, "The delay between the first and second message is 1 second.")
		Assert.assertTrue((messageTime[2] - messageTime[1]) > 10000, "The delay between the second and third message is 10 seconds.")
	}	
	
}
