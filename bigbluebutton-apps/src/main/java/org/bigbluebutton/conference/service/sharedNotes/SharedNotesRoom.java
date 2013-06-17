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
import name.fraser.neil.plaintext.diff_match_patch;
import name.fraser.neil.plaintext.diff_match_patch.Patch;
import name.fraser.neil.plaintext.diff_match_patch.Diff;
import java.util.LinkedList;

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
	private static final Object syncObject = new Object();
	private diff_match_patch diffPatch = new diff_match_patch();

	public SharedNotesRoom(String name) {
		this.name = name;
		this.listeners = new ConcurrentHashMap<String, ISharedNotesRoomListener>();
		this.clients = new ConcurrentHashMap<Long, ClientSharedNotes>();
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

	public void addRoomClient(Long userid) {
		if (! clients.containsKey(userid)) {
			synchronized (syncObject) {
				clients.put(userid, new ClientSharedNotes(userid, _document));
			}
			
		}
	}

	public void removeRoomClient(Long userid) {
		synchronized (syncObject) {
			if (! clients.containsKey(userid)) {
				clients.remove(userid);
			}
		}
	}

	public void removeRoomListener(ISharedNotesRoomListener listener) {
		log.debug("removing room listener");
		listeners.remove(listener);	
	}

	public String currentDocument(Long userid) {
		String document = "";
		synchronized (syncObject) {
			document = clients.get(userid).getDocument();
		}
		return document;
	}

	public boolean patchClient(Long userid, String patch, Integer beginIndex, Integer endIndex) {
		synchronized (syncObject) {	
			if(clients.containsKey(userid)) {
				ClientSharedNotes client = clients.get(userid);
				client.patchClient(patch);
				patchServer(patch);
				sendModificationsToClients(beginIndex, endIndex);
			}
		}
		return true;
	}


	private void sendModificationsToClients(Integer beginIndex, Integer endIndex) {
		 for (Iterator<ClientSharedNotes> iter = clients.values().iterator(); iter.hasNext();) {
			ClientSharedNotes client = (ClientSharedNotes) iter.next();
			LinkedList<Diff> diffs = diffPatch.diff_main(client.getDocument(), _document);
			client.setDocument(_document);
			LinkedList<Patch> patchObjects = diffPatch.patch_make(diffs);
			String patches = diffPatch.patch_toText(patchObjects);
			for (Iterator<ISharedNotesRoomListener> iter2 = listeners.values().iterator(); iter2.hasNext();) {
				ISharedNotesRoomListener listener = (ISharedNotesRoomListener) iter2.next();
				listener.remoteModifications(client.getUserid(), patches, beginIndex, endIndex);
			}
		 }
	}
	private void patchServer(String patch) {
		LinkedList<Patch> patchObjects = diffPatch.patch_fromText(patch);
   		Object[] result = diffPatch.patch_apply(patchObjects, _document);
		_document = result[0].toString();
	}

	public void patchDocument(Long userid, String patch, Integer beginIndex, Integer endIndex) {
		patchClient(userid, patch, beginIndex, endIndex);
	}
}


