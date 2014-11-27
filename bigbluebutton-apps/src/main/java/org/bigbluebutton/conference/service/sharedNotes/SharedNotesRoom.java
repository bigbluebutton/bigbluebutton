/**
		log.debug("AddNote request received.");
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

import java.util.UUID;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import name.fraser.neil.plaintext.diff_match_patch;
import name.fraser.neil.plaintext.diff_match_patch.Patch;
import name.fraser.neil.plaintext.diff_match_patch.Diff;
import java.util.LinkedList;
import java.util.UUID;
import java.util.concurrent.ConcurrentSkipListSet;

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
	private final Set<String> clients;
	private Map<String,String> documents = new ConcurrentHashMap<String, String>();
	private static final Object syncObject = new Object();
	private diff_match_patch diffPatch = new diff_match_patch();
    private Integer noteCounter;
    private List<Integer> removedNotes = new ArrayList<Integer>();

	public SharedNotesRoom(String name) {
		this.name = name;
		this.listeners = new ConcurrentHashMap<String, ISharedNotesRoomListener>();
		this.clients = new ConcurrentSkipListSet<String>();
        this.documents.put("MAIN_WINDOW","");
        this.noteCounter=1;
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

	public void addRoomClient(String userid) {
		if (! clients.contains(userid)) {
			synchronized (syncObject) {
				clients.add(userid);
			}
			
		}

	}

	public void removeRoomClient(String userid) {
		synchronized (syncObject) {
			if (! clients.contains(userid)) {
				clients.remove(userid);
			}
		}
	}

	public void removeRoomListener(ISharedNotesRoomListener listener) {
		log.debug("removing room listener");
		listeners.remove(listener);	
	}

	public Map<String,String> currentDocument(String userid) {
		return documents;
	}

	public boolean patchClient(String noteId, String userid, String patch, Integer beginIndex, Integer endIndex) {
		synchronized (syncObject) {	
			if(clients.contains(userid)) {	
				patchServer(noteId,patch);
				sendModificationsToClients(userid, noteId, patch, beginIndex, endIndex);
			}
		}
		return true;
	}

    private void patchServer(String noteId, String patch) {
        String _document = documents.get(noteId);
		LinkedList<Patch> patchObjects = diffPatch.patch_fromText(patch);
   		Object[] result = diffPatch.patch_apply(patchObjects, _document);
		documents.put(noteId, result[0].toString());
	}

	private void sendModificationsToClients(String srcUser, String noteId, String patch, Integer beginIndex, Integer endIndex) {
         String _document = documents.get(noteId);
		 for (Iterator<String> iter = clients.iterator(); iter.hasNext();) {
            String userId = (String) iter.next();
            if(!userId.equals(srcUser)){
                for (Iterator<ISharedNotesRoomListener> iter2 = listeners.values().iterator(); iter2.hasNext();)             {
                    ISharedNotesRoomListener listener = (ISharedNotesRoomListener) iter2.next();
                    listener.remoteModifications(noteId, userId, patch, beginIndex, endIndex);
                }
		    }
        }
	}

	public void patchDocument(String noteId, String userid, String patch, Integer beginIndex, Integer endIndex){
		patchClient(noteId, userid, patch, beginIndex, endIndex);
	}

	public void createAdditionalNotes() {
        synchronized (syncObject) {
        	String noteId;
        	if (removedNotes.isEmpty()) {
        		noteId = (noteCounter++).toString();
        	} else {
        		noteId = removedNotes.remove(0).toString();
        	}
            documents.put(noteId, "");

		for (Map.Entry<String, ISharedNotesRoomListener> entry : listeners.entrySet()) {
			ISharedNotesRoomListener listener = entry.getValue();
			listener.createAdditionalNotes(noteId);
		}}
	}

	public void destroyAdditionalNotes(String notesId) {
        synchronized (syncObject) {	
            documents.remove(notesId);
            removedNotes.add(Integer.parseInt(notesId));
            Collections.sort(removedNotes);
		for (Map.Entry<String, ISharedNotesRoomListener> entry : listeners.entrySet()) {
			ISharedNotesRoomListener listener = entry.getValue();
			listener.destroyAdditionalNotes(notesId);
		}}
	}
}


