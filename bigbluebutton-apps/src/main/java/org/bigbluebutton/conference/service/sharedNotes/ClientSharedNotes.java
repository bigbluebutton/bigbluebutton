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


import name.fraser.neil.plaintext.diff_match_patch;
import name.fraser.neil.plaintext.diff_match_patch.Patch;
import java.util.LinkedList;
import java.util.Map;

public class ClientSharedNotes {
	
	private Map<String, String> document;
	private String userid;
	private diff_match_patch diffPatch = new diff_match_patch();

	public ClientSharedNotes(String userid, Map<String, String> document) {
		this.userid = userid;
		this.document = document;
	}

	public String getUserid() {
		return userid;
	}

	public Map<String,String> getDocument() {
		return document;
	}

	public String getDocument(String noteId) {
		return document.get(noteId);
	}

    public void setDocument(String noteId, String document) {
		this.document.put(noteId, document);
	}

	public void patchClient(String noteId, String patch) {
		 LinkedList<Patch> patchObjects = diffPatch.patch_fromText(patch);
		 Object[] result = diffPatch.patch_apply(patchObjects, getDocument(noteId));
		 String patchedDocument = result[0].toString();
		 setDocument(noteId,patchedDocument);
    	}


}
