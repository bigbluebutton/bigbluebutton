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

import java.util.Map;
import java.util.HashMap;
import java.util.List;

import org.red5.server.api.so.IClientSharedObject;
import org.red5.server.api.so.ISharedObjectBase;
import org.red5.server.net.rtmp.RTMPConnection;
import org.red5.server.net.rtmp.codec.RTMP;

/**
 * An event stream to listen to conference events.
 * 
 * TODO: This class is not fully implemented. Need to figure out the proper way of 
 * logging into the conference. Access to updates about the participants actually requires
 * providing login and password. However, we can get away with the information collected
 * by the meet me event stream, which collects voice conference events.
 * 
 * @author michael.r.weiss
 *
 */
public class ConferenceEventStream extends EventStream {

	protected IClientSharedObject participantsSO;

	public ConferenceEventStream(String host, String room) {
		super(host, room);
	}

	public String getApplication() {
		return "conference";
	}
	
	public void init() {
		Map<String, Object> tparams = new HashMap<String, Object>();
		tparams.put("password", "student");
		tparams.put("username", "mweiss2");
		Object[] obj = new Object[] { tparams };
	}

	public void connectionOpened(RTMPConnection conn, RTMP state) {
		super.connectionOpened(conn, state);
		participantsSO = subscribeSharedObject(conn, "participantsSO");
		if (participantsSO == null) {
			System.err.println("Could not connect to shared object particiantsSO");
		}
	}

	public void onSharedObjectSend(ISharedObjectBase so, String method, List params) {
		if (method.equals("")) {
			out.println("<status time=\"" + getTimestamp() + 
					"\" user=\"" + params.get(0) +
					"\"/>");
			out.flush();
		}
	}
	
	public void onSharedObjectUpdate(ISharedObjectBase so, String key, Object value) {
		if (debug) {
			System.out.println("Update on shared object (conference): " + key + "{" + value + "}");
		}
	}

}
