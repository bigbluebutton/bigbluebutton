
package org.bigbluebutton.conference.service.archive.recorder

import org.testng.annotations.BeforeMethodimport org.testng.annotations.Testimport org.bigbluebutton.conference.service.archive.record.RecordSessionimport org.bigbluebutton.conference.service.archive.record.IRecorderimport org.bigbluebutton.conference.service.archive.record.IEventRecorderimport org.testng.Assert
public class RecordSessionTest{
	RecordSession session
	
	@BeforeMethod
	public void setUp() {
		session = new RecordSession('test-conference', 'test-room')
	}

	@Test
	public void recordSessionTest() {
		// Mock the IEventRecorder interface
		def recorderPassedFromRecordSession
		def eventRecorderMockGetNameMethod = {
				return 'PARTICIPANT'
		}
		def eventRecorderMockAcceptRecorderMethod = {
			recorderPassedFromRecordSession = it
		}
		def eventRecorderMockRecordEventMethod = {
			recorderPassedFromRecordSession.recordEvent(it)
		}
		
		def eventRecorderMock = [getName:eventRecorderMockGetNameMethod, acceptRecorder:eventRecorderMockAcceptRecorderMethod, recordEvent:eventRecorderMockRecordEventMethod] as IEventRecorder
		
		// Setup our test event to be recorded
		Map event1 = new HashMap()
		event1.put("date", 1236202132980)
		event1.put("application", "PARTICIPANT")
		event1.put("event", "ParticipantJoinedEvent")
		event1.put("message", "Las Vegas, Nevada, USA")
		
		// Mock the IRecorder interface
		def sampleEventRecorder = {
				Assert.assertEquals(event1, it, "The returned event shoule be the same as the one that we sent.")
		}
		def r = [recordEvent:sampleEventRecorder] as IRecorder
		
		// Use the mocked recorder in our session
		session.setRecorder(r)
		
		session.addEventRecorder(eventRecorderMock)
		eventRecorderMock.recordEvent(event1)
	}		
	
}
