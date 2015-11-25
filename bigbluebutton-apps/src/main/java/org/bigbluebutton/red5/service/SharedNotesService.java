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

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.Red5;
import org.red5.server.api.scope.IScope;
import org.bigbluebutton.red5.BigBlueButtonSession;
import org.bigbluebutton.red5.Constants;

public class SharedNotesService {
	
	private static Logger log = Red5LoggerFactory.getLogger( SharedNotesService.class, "bigbluebutton" );
	
	private SharedNotesApplication sharedNotesApplication;

	private BigBlueButtonSession getBbbSession() {
		return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	}

	public void currentDocument() {
		log.debug("SharedNotesService.currentDocument");
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String requesterID = getBbbSession().getInternalUserID();

		sharedNotesApplication.currentDocument(meetingID, requesterID);
	}
	
	public void patchDocument(Map<String, Object> msg) {
		log.debug("SharedNotesService.patchDocument");
		String noteID = msg.get("noteID").toString();
		String patch = msg.get("patch").toString();

		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String requesterID = getBbbSession().getInternalUserID();

		sharedNotesApplication.patchDocument(meetingID, requesterID, noteID, patch);
	}

	public void createAdditionalNotes(Map<String, Object> msg) {
		log.debug("SharedNotesService.createAdditionalNotes");
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String requesterID = getBbbSession().getInternalUserID();
		String noteName = msg.get("noteName").toString();

		sharedNotesApplication.createAdditionalNotes(meetingID, requesterID, noteName);
	}

	public void destroyAdditionalNotes(Map<String, Object> msg) {
		log.debug("SharedNotesService.destroyAdditionalNotes");
		String noteID = msg.get("noteID").toString();

		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String requesterID = getBbbSession().getInternalUserID();

		sharedNotesApplication.destroyAdditionalNotes(meetingID, requesterID, noteID);
	}

	public void requestAdditionalNotesSet(Map<String, Object> msg) {
		log.debug("SharedNotesService.requestAdditionalNotesSet");
		Integer additionalNotesSetSize = (Integer) msg.get("additionalNotesSetSize");

		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String requesterID = getBbbSession().getInternalUserID();

		sharedNotesApplication.requestAdditionalNotesSet(meetingID, requesterID, additionalNotesSetSize);
	}

	public void setSharedNotesApplication(SharedNotesApplication a) {
		log.debug("Setting sharedNotes sharedNotesApplication");
		sharedNotesApplication = a;
	}
}