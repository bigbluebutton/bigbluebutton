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

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import net.jcip.annotations.ThreadSafe;

import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
/**
* Contains information about a SharedNotesRoom.
*/
@ThreadSafe
public class SharedNotesRoom {
	private static Logger log = Red5LoggerFactory.getLogger( SharedNotesRoom.class, "bigbluebutton" );

	private final String name;
	private final Map<String, ISharedNotesRoomListener> listeners;
	private final Map<Long, ClientSharedNotes> clients;
	private String _document = "";

	public SharedNotesRoom(String name) {
		this.name = name;
		this.listeners = new ConcurrentHashMap<String, ISharedNotesRoomListener>();
	}

	public String getName() {
		return name;
	}

	public void addRoomListener(ISharedNotesRoomListener listener) {
		if (! listeners.containsKey(listener.getName())) {
			log.debug("adding room listener");
			listeners.put(listener.getName(), listener);	
		}
	}

	public void removeRoomListener(ISharedNotesRoomListener listener) {
		log.debug("removing room listener");
		listeners.remove(listener);	
	}

	private void updateDocument(String document) {
		for (Iterator<ISharedNotesRoomListener> iter = listeners.values().iterator(); iter.hasNext();) {
			log.debug("calling on listener");
			ISharedNotesRoomListener listener = (ISharedNotesRoomListener) iter.next();
			log.debug("calling updateSharedNotes on listener " + listener.getName());
			//listener.updateLayout(currentLayout());
		}
	}

	public String currentDocument() {
		return _document;
	}

	public void patchDocument(int userId, String patch) {
		//Do the patch
		//UpdateListeners
	}
}


