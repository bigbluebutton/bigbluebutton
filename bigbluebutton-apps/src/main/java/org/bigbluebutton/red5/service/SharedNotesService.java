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
 * Author: Hugo Lazzari <hslazzari@gmail.com>
 */
package org.bigbluebutton.red5.service;

import java.util.Map;
import org.red5.server.api.Red5;
import org.bigbluebutton.red5.BigBlueButtonSession;
import org.bigbluebutton.red5.Constants;

public class SharedNotesService {

	private SharedNotesApplication sharedNotesApplication;

	private BigBlueButtonSession getBbbSession() {
		return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	}

	public void currentDocument() {
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String requesterID = getBbbSession().getInternalUserID();

		sharedNotesApplication.currentDocument(meetingID, requesterID);
	}

	public void patchDocument(Map<String, Object> msg) {
		String noteID = msg.get("noteID").toString();
		String patch = msg.get("patch").toString();
		String operation = msg.get("operation").toString();

		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String requesterID = getBbbSession().getInternalUserID();

		sharedNotesApplication.patchDocument(meetingID, requesterID, noteID, patch, operation);
	}

	public void createAdditionalNotes(Map<String, Object> msg) {
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String requesterID = getBbbSession().getInternalUserID();
		String noteName = msg.get("noteName").toString();

		sharedNotesApplication.createAdditionalNotes(meetingID, requesterID, noteName);
	}

	public void destroyAdditionalNotes(Map<String, Object> msg) {
		String noteID = msg.get("noteID").toString();

		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String requesterID = getBbbSession().getInternalUserID();

		sharedNotesApplication.destroyAdditionalNotes(meetingID, requesterID, noteID);
	}

	public void requestAdditionalNotesSet(Map<String, Object> msg) {
		Integer additionalNotesSetSize = (Integer) msg.get("additionalNotesSetSize");

		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String requesterID = getBbbSession().getInternalUserID();

		sharedNotesApplication.requestAdditionalNotesSet(meetingID, requesterID, additionalNotesSetSize);
	}

	public void sharedNotesSyncNoteRequest(Map<String, Object> msg) {
		String noteID = msg.get("noteID").toString();

		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String requesterID = getBbbSession().getInternalUserID();

		sharedNotesApplication.sharedNotesSyncNoteRequest(meetingID, requesterID, noteID);
	}

	public void setSharedNotesApplication(SharedNotesApplication a) {
		sharedNotesApplication = a;
	}
}