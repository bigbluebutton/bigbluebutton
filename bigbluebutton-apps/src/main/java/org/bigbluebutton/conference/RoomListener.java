/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/

package org.bigbluebutton.conference;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.red5.server.api.so.ISharedObject;

public class RoomListener implements IRoomListener{

	private ISharedObject so;

	public RoomListener(ISharedObject so) {
		this.so = so; 
	}
	
	public String getName() {
		return "TEMPNAME";
	}
	
	@SuppressWarnings("unchecked")
	public void participantStatusChange(User p, String status, Object value){
		List list = new ArrayList();
		list.add(p.getInternalUserID());
		list.add(status);
		list.add(value);
		so.sendMessage("participantStatusChange", list);
	}
	
	@SuppressWarnings("unchecked")
	public void participantJoined(User p) {
		List args = new ArrayList();
		args.add(p.toMap());
		so.sendMessage("participantJoined", args);
	}
	
	@SuppressWarnings("unchecked")
	public void participantLeft(User p) {		
		List args = new ArrayList();
		args.add(p.getInternalUserID());
		so.sendMessage("participantLeft", args);
	}

	public void assignPresenter(ArrayList<String> presenter) {
		so.sendMessage("assignPresenterCallback", presenter);
	}
	
	public void endAndKickAll() {
		// no-op
	}

	@Override
	public void lockSettingsChange(Map<String, Boolean> lockSettings) {
		List list = new ArrayList();
		list.add(lockSettings);
		so.sendMessage("lockSettingsChange", list);
	}	
}
