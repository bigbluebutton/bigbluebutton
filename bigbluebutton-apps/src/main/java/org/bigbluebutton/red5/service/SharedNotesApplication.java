/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
* Author: Felipe Cecagno <felipe@mconf.org>
*/
package org.bigbluebutton.red5.service;

import org.bigbluebutton.red5.pubsub.MessagePublisher;

public class SharedNotesApplication {

	private MessagePublisher red5BBBInGW;

	public void setRed5Publisher(MessagePublisher inGW) {
		red5BBBInGW = inGW;
	}

	public void clear(String meetingID) {
	}

	public void patchDocument(String meetingID, String requesterID, String noteID, String patch, String operation) {
		red5BBBInGW.patchDocument(meetingID, requesterID, noteID, patch, operation);
	}

	public void currentDocument(String meetingID, String requesterID) {
		red5BBBInGW.getCurrentDocument(meetingID, requesterID);
	}

	public void createAdditionalNotes(String meetingID, String requesterID, String noteName) {
		red5BBBInGW.createAdditionalNotes(meetingID, requesterID, noteName);
	}

	public void destroyAdditionalNotes(String meetingID, String requesterID, String noteID) {
		red5BBBInGW.destroyAdditionalNotes(meetingID, requesterID, noteID);
	}

	public void requestAdditionalNotesSet(String meetingID, String requesterID, int additionalNotesSetSize) {
		red5BBBInGW.requestAdditionalNotesSet(meetingID, requesterID, additionalNotesSetSize);
	}

	public void sharedNotesSyncNoteRequest(String meetingID, String requesterID, String noteID) {
		red5BBBInGW.sharedNotesSyncNoteRequest(meetingID, requesterID, noteID);
	}
}
