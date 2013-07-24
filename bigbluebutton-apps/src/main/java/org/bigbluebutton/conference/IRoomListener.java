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

public interface IRoomListener {
	public String getName();
	public void participantStatusChange(User p, String status, Object value);
	public void participantJoined(User participant);
	public void participantLeft(User participant);
	public void assignPresenter(ArrayList<String> presenter);
	public void guestEntrance(User p);
	public void endAndKickAll();
	public void guestResponse(User p, Boolean resp);
	public void guestWaitingForModerator(String userid, String userId_userName); 
	public void guestPolicyChanged(String guestPolicy);
}
