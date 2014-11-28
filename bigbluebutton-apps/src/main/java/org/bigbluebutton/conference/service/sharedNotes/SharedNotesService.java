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
package org.bigbluebutton.conference.service.sharedNotes;

import java.util.List;
import java.util.Map;

import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.Red5;
import org.slf4j.Logger;

public class SharedNotesService {
	
	private static Logger log = Red5LoggerFactory.getLogger( SharedNotesService.class, "bigbluebutton" );
	
	private SharedNotesApplication application;

	public Map<String,String>  currentDocument(String userid) {
		String roomName = Red5.getConnectionLocal().getScope().getName();
		return application.currentDocument(roomName, userid);
	}
	
	public void patchDocument(String noteId, String userId, String patch, Integer beginIndex, Integer endIndex) {
		String roomName = Red5.getConnectionLocal().getScope().getName();
		application.patchDocument(roomName, noteId,userId, patch, beginIndex, endIndex);
	}

	public void createAdditionalNotes() {
		String roomName = Red5.getConnectionLocal().getScope().getName();
		application.createAdditionalNotes(roomName);
	}

	public void destroyAdditionalNotes(String notesId) {
		String roomName = Red5.getConnectionLocal().getScope().getName();
		application.destroyAdditionalNotes(roomName, notesId);
	}

	public void setSharedNotesApplication(SharedNotesApplication a) {
		log.debug("Setting sharedNotes application");
		application = a;
	}

	public void createAdditionalNotesSet(Integer additionalNotesSetSize) {
		String roomName = Red5.getConnectionLocal().getScope().getName();
		application.createAdditionalNotesSet(roomName, additionalNotesSetSize);
	}
}

