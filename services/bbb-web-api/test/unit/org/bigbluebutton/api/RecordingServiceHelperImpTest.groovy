package org.bigbluebutton.api;
import java.io.File;

import org.bigbluebutton.api.domain.Recording;

class RecordingServiceHelperImpTest extends GroovyTestCase {
	
	def recordedXmlText = '''
			<?xml version="1.0" encoding="UTF-8"?>
			<recording meeting_id="974a4b8c-5bf7-4382-b4cd-eb26af7dfcc2">
			  <metadata
			    title="Business Ecosystem"
			    subject="TTMG 5001"
			    description="How to manage your product's ecosystem"
			    creator="Richard Alam"
			    contributor="Popen3"
			    language="en-US"
			    identifier="ttmg-5001-2"
			  />
			  <event timestamp="1305560822952" module="PARTICIPANT" eventname="ParticipantJoinEvent">
			    <role>MODERATOR</role>
			    <userId>11</userId>
			    <status>{raiseHand=false, hasStream=false, presenter=false}</status>
			  </event>
			  <event timestamp="1305561067407" module="PARTICIPANT" eventname="EndAndKickAllEvent">
			  </event>
			</recording>
	'''
	
	void setUp() {
	}
	
	void testGetRecordingInfo() {
		RecordingServiceHelperImpTest rshi = new RecordingServiceHelperImpTest()
		Recording recording = rshi.getInfo(new XmlSlurper().parseText(recordedXmlText))
		String[] meetings = recordings.getRecordings("/var/bigbluebutton/recordings")
		for (int i = 0; i < meetings.length; i++) {
			println meetings[i];
		}
	}
}