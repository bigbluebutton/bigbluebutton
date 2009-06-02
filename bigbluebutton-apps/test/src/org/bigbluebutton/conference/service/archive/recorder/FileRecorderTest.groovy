
package org.bigbluebutton.conference.service.archive.recorder

import org.testng.annotations.BeforeMethodimport org.testng.annotations.Testimport org.bigbluebutton.conference.service.archive.record.FileRecorderimport org.ho.yaml.YamlDecoderimport groovy.util.AntBuilderimport groovy.xml.MarkupBuilder
import org.bigbluebutton.conference.Participant

public class FileRecorderTest{
	FileRecorder recorder
	String conference = "test-conference"
	String room = "test-room"
	File recordingsDir
		
	def deleteDirectory = {directory ->
		System.out.println("delete = ${directory}")
		/**
		 * Go through each directory and check if it's not empty.
		 * We need to delete files inside a directory before a
		 * directory can be deleted.
		**/
		File[] files = directory.listFiles();				
		for (int i = 0; i < files.length; i++) {
			if (files[i].isDirectory()) {
				deleteDirectory(files[i])
			} else {
				files[i].delete()
			}
		}
		// Now that the directory is empty. Delete it.
		directory.delete()	
	}
	
	@BeforeMethod
	public void setUp() {		
		recordingsDir = new File('build/test/resources')
		if (recordingsDir.exists())
			deleteDirectory(recordingsDir)
		recordingsDir.mkdirs()
		recorder = new FileRecorder(conference, room)
		recorder.setRecordingsDirectory(recordingsDir.canonicalPath)
		recorder.initialize()
		recorder.deleteRecording()
	}

	@Test(groups = ["checkintest", "broken"] )
	public void writeEventToFileTest() {
		Map event1 = new HashMap()
		event1.put("date", 1237212144317)
		event1.put("application", "PARTICIPANT")
		event1.put("event", "participantJoined")
		Map user1 = new HashMap()		 
		Map status1 = new HashMap()
		user1.put('status', status1)
		event1.put("user", user1)
		status1.put("raiseHand", false)
		status1.put("presenter", false)
		status1.put("hasStream", false)
		user1.put('name', 'RE')
		user1.put('userid', 0L)
		user1.put('role', 'MODERATOR')

		Map event2 = new HashMap()
		event2.put("date", 1237212154317)
		event2.put("application", "PARTICIPANT")
		event2.put("event", "participantLeft")
		event2.put('userid', 0L)
		
		recorder.recordEvent(event1)
		recorder.recordEvent(event2)
		
		Map event3 = new HashMap()
		event3.put("date", 1237212197806)
		event3.put("application", "PARTICIPANT")
		event3.put("event", "participantJoined")
		Map user3 = new HashMap()		 
		Map status3 = new HashMap()
		user3.put('status', status3)
		event3.put("user", user3)
		status3.put("raiseHand", false)
		status3.put("presenter", false)
		status3.put("hasStream", false)
		user3.put('name', 'AS')
		user3.put('userid', 1L)
		user3.put('role', 'MODERATOR')
		
		Map event4 = new HashMap()
		event4.put("date", 1237212203231)
		event4.put("application", "PARTICIPANT")
		event4.put("event", "participantStatusChange")
		event4.put('status', 'presenter')
		event4.put('value', true)

		recorder.recordEvent(event3)
		recorder.recordEvent(event4)
		
		Map event5 = new HashMap()
		event5.put("date", 1237212204231)
		event5.put("application", "PARTICIPANT")
		event5.put("event", "participantLeft")
		event5.put('userid', 1L)
		
		recorder.recordEvent(event5)
		
		File recordingFile = new File("$recordingsDir.canonicalPath/$conference/$room/recordings.yaml" )
		assert recordingFile.exists()
		
		// Let's read back the saved data.
        YamlDecoder dec = new YamlDecoder(recordingFile.newInputStream());
        def eventList = []
        try {
        	while (true) {        		
        		Map eventRead = dec.readObject() // Not sure why this fails...the FileReaderPlayback works..
        		eventList.add(eventRead)
        	}
        } catch (EOFException e){
        	println("Finished reading stream.")
        } finally {
        	dec.close();
        }
        
        assert eventList.size() == 5
		assert eventList[0].date == 1237212144317
		assert eventList[0]['application'] == 'PARTICIPANT'
		assert eventList[0]['event'] == 'ParticipantJoinedEvent'
	}
	
	@Test
	public void writeXmlEventToFileTest() {		 
		Map pstatus = new HashMap()
		pstatus.put("raiseHand", false)
		pstatus.put("presenter", false)
		pstatus.put("hasStream", false)
		
		Participant p = new Participant(1L, 'AS', 'MODERATOR', pstatus)
		
		def writer = new StringWriter()

		def xml = new MarkupBuilder(writer)
		xml.event(name:'participantJoined', date:new Date().time, application:'PARTICIPANT') {
			user(name:'RE', userid: 0L, role:'MODERATOR') {
				statuses() {
					for (key in p.status.keySet()) {
						status(name:key, value:p.status.get(key))
					}
				}
				slide(new Integer(1))
			}
		}

		recorder.recordXmlEvent(writer.toString())
		
	}
}
