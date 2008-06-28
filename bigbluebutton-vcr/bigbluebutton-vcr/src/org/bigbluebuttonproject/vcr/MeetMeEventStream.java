/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebuttonproject.vcr;

import java.util.HashMap;
import java.util.List;

import org.red5.server.api.so.IClientSharedObject;
import org.red5.server.api.so.ISharedObjectBase;
import org.red5.server.net.rtmp.RTMPConnection;
import org.red5.server.net.rtmp.codec.RTMP;

/**
 * An event stream that listens for meet me events.
 * 
 * @author michael.r.weiss
 *
 */
public class MeetMeEventStream extends EventStream {

	protected IClientSharedObject meetMeUsersSO;
	
	protected HashMap<Integer, Boolean> whoIsTalking;
	protected HashMap<Integer, Long> whenAreTheyTalking;
	
	protected IClientSharedObject participantsSO;

	public MeetMeEventStream(String host, String room) {
		super(host, room);
		whoIsTalking = new HashMap<Integer, Boolean>();
		whenAreTheyTalking = new HashMap<Integer, Long>();
	}
	
	public String getApplication() {
		return "astmeetme";
	}

	public void connectionOpened(RTMPConnection conn, RTMP state) {
		super.connectionOpened(conn, state);
		meetMeUsersSO = subscribeSharedObject(conn, "meetMeUsersSO");
		participantsSO = subscribeSharedObject(conn, "participantsSO");
	}
	
	public void onSharedObjectSend(ISharedObjectBase so, String method, List params) {
		// the code below is a bit convoluted as I am combining multiple talk
		// events, while they indicate that the user is talking, into one event;
		// this event is more useful, because it indicates how long the user
		// was talking before s/he made a pause
		if (method.equals("userTalk")) {
			Boolean talkingHolder = whoIsTalking.get(
				(Integer) params.get(0));
			boolean talking;
			if (talkingHolder == null) {
				talking = false;
			} else {
				talking = talkingHolder.booleanValue();
			}
			if (!talking) {
				if (((Boolean) params.get(1)).booleanValue()) {
					// record who and when they started to talk
					whoIsTalking.put((Integer) params.get(0), 
						new Boolean(true));
					whenAreTheyTalking.put((Integer) params.get(0), 
						new Long(getTimestamp()));
				} else {
					// can ignore events that say that user is not talking
				}
			} else {
				// we know they were talking, so check if they stopped
				if (!((Boolean) params.get(1)).booleanValue()) {
					// record when they stopped to talk ...
					Long startTime = whenAreTheyTalking.get(
						(Integer) params.get(0));
					out.println("<talk user=\"" + params.get(0) +
						"\" start=\"" + startTime +
						"\" end=\"" + getTimestamp() +
						"\"/>");
					out.flush();
					// ... and record that they stopped talking
					whoIsTalking.put((Integer) params.get(0), 
						new Boolean(false));
				} else {
					// can ignore events that say that they are still talking
				}
			}
		// a new user has joined the voice conference
		// extract user id and phone number
		} else if (method.equals("userJoin")) {
			out.println("<join time=\"" + getTimestamp() + 
					"\" user=\"" + params.get(0) + 
					"\" cidName=\"" + params.get(1) + 
					"\" cidNumber=\"" + params.get(2) + 
					"\" muted=\"" + params.get(3) + 
					"\" talking=\"" + params.get(4) + 
					"\"/>");
			out.flush();
		// a user has left the voice conference
		} else if (method.equals("userLeft")) {
			out.println("<left time=\"" + getTimestamp() + 
					"\" user=\"" + params.get(0) +
					"\"/>");
			out.flush();
		}
	}
	
	public void onSharedObjectUpdate(ISharedObjectBase so, String key, Object value) {
		// just checking if there are any update events (can remove this)
		if (debug) {
			System.out.println("Update on shared object (meetme): " + key + "{" + value + "}");
		}
	}

}
