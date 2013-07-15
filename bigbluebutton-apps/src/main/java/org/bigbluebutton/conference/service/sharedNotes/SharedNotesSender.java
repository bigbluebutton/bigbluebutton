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
package org.bigbluebutton.conference.service.sharedNotes;

import java.util.List;

import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.so.ISharedObject;
import org.red5.server.api.statistics.ISharedObjectStatistics;
import org.slf4j.Logger;
import java.util.ArrayList;

public class SharedNotesSender implements ISharedNotesRoomListener {

	private static Logger log = Red5LoggerFactory.getLogger( SharedNotesSender.class, "bigbluebutton" );

	private ISharedObject so;
	private String name = "SHAREDNOTES";

	public SharedNotesSender(ISharedObject so) {
		this.so = so;
	}

	@Override
	public String getName() {
		return name;
	}

	@Override
	public void initClientDocument(String userid, String document) {
		List<Object> args = new ArrayList<Object>();
		args.add(userid);
		args.add(document);
		so.sendMessage("initClientDocumentCallBack", args);
	}

	@Override
	public void remoteModifications(String userid, String patches, Integer beginIndex, Integer endIndex) {
		List<Object> args = new ArrayList<Object>();
		args.add(userid);
		args.add(patches);
		args.add(beginIndex);
		args.add(endIndex);
		so.sendMessage("remoteModificationsCallBack", args);
	}
}
