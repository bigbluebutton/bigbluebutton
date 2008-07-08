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

import java.util.List;

import org.red5.server.net.rtmp.RTMPConnection;
import org.red5.server.net.rtmp.codec.RTMP;
import org.red5.server.api.so.IClientSharedObject;
import org.red5.server.api.so.ISharedObjectBase;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

/**
 * Sample class that uses the client mode of the RTMP library
 * to connect to chat application.
 *
 * @author michael.r.weiss
 */
public class ChatEventStream extends EventStream {
	
	protected IClientSharedObject chatSO;
	
	public ChatEventStream(String host, String room) {
		super(host, room);
	}

	public String getApplication() {
		return "chatServer";
	}
	
	public void connectionOpened(RTMPConnection conn, RTMP state) {
		super.connectionOpened(conn, state);
		chatSO = subscribeSharedObject(conn, "chatSO");
	}
		    
	public void onSharedObjectSend(ISharedObjectBase so, String method, List params) {
		if (method.equals("newMessage")) {
			Pattern p = Pattern.compile("\\[(.+)\\]</b> (.+)</font>");
			Matcher m = p.matcher((String) params.get(0));
			if (m.find()) {
				String name = m.group(1);
				String message = m.group(2);
				out.println("<chat time=\"" + getTimestamp() + 
						"\" user=\"" + name + "\">" + message + "</chat>");
				out.flush();
			}
		}
	}

}