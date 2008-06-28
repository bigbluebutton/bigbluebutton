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

import java.io.PrintWriter;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.red5.server.api.IAttributeStore;
import org.red5.server.api.service.IServiceCall;
import org.red5.server.api.so.IClientSharedObject;
import org.red5.server.api.so.ISharedObjectBase;
import org.red5.server.api.so.ISharedObjectListener;
import org.red5.server.net.protocol.ProtocolState;
import org.red5.server.net.rtmp.Channel;
import org.red5.server.net.rtmp.RTMPClient;
import org.red5.server.net.rtmp.RTMPConnection;
import org.red5.server.net.rtmp.codec.RTMP;
import org.red5.server.net.rtmp.event.IRTMPEvent;
import org.red5.server.net.rtmp.event.Notify;
import org.red5.server.net.rtmp.event.Ping;
import org.red5.server.net.rtmp.message.Header;
import org.red5.server.net.rtmp.message.Packet;
import org.red5.server.so.ISharedObjectEvent;
import org.red5.server.so.ISharedObjectMessage;
import org.red5.server.so.SharedObjectMessage;

/**
 * An event stream 
 * @author michael.r.weiss
 *
 */
public abstract class EventStream extends RTMPClient implements ISharedObjectListener {
	
	public static boolean debug = true;

	protected String host;
	protected String room;
	protected EventWriter out;
	
	/**
	 * For pretty printing talk events (@see also messageReceived).
	 */ 
	protected int events = 0;
	
	public EventStream(String host, String room) {
		this.host = host;
		this.room = room;
		init();
	}
		
	public void init() {
		connect(host, 1935, getApplication() + "/" + room, null);
	}
	
	public void setWriter(EventWriter out) {
		this.out = out;
	}
	
	public abstract String getApplication();

	public IClientSharedObject subscribeSharedObject(RTMPConnection conn, String name) {
		return subscribeSharedObject(conn, name, false);
	}

	public IClientSharedObject subscribeSharedObject(RTMPConnection conn, String name, boolean persistent) {
		IClientSharedObject so = getSharedObject(name, false);
		so.connect(conn);
		so.addSharedObjectListener(this);
		return so;
	}
	
	public long getTimestamp() {
		return System.currentTimeMillis();
	}
		
	synchronized public void messageReceived(RTMPConnection conn, ProtocolState state, Object in)
		throws Exception {
		if (debug) {
			Packet packet = (Packet) in;
			IRTMPEvent message = packet.getMessage();
			String body = message.toString();
			if (body.startsWith("Ping")) {
				// System.out.print("[PING]");
			} else if (body.indexOf("userTalk") > -1) {
				// give visual feedback that a user is talking (< talking, - silent)
				int i = body.indexOf("[");
				int j = body.indexOf(",", i);
				int k = body.indexOf("]", j);
				String user = body.substring(i+1, j);
				String talking = body.substring(j+2, k);
				// System.out.print("(" + events + ")");
				if (talking.equals("true")) {
					System.out.print(user + "<");
				} else {
					System.out.print(user + "_");
				}
				if (events++ >= 10) {
					System.out.println();
					events = 0;
				}
			} else {
				System.out.println(getTimestamp() + "@" + message);
			}
		}
		// the super method does all the real work, such as dispatching to 
		// onPing, onSharedObject, and onInvoke
		super.messageReceived(conn, state, in);
	}

	public void onPing(RTMPConnection conn, Channel channel, Header source, Ping ping) {
		super.onPing(conn, channel, source, ping);
	}

	/**
	 * This method fixes a problem in Red5 that only CLIENT_SEND_MESSAGEs get propagate.
	 * However, the messages received from shared objects are SEVER_SEND_MESSAGEs.
	 */
	public void onSharedObject(RTMPConnection conn, Channel channel,
		Header source, SharedObjectMessage object) {
    	ISharedObjectMessage msg = (ISharedObjectMessage) object;
    	// a message may contain a sequence of events
    	// TODO: from testing this, it seems there is every only one event, but this code
    	// should be cleaned up accordingly
		for (ISharedObjectEvent event : msg.getEvents()) {
			switch (event.getType()) {
				case SERVER_SEND_MESSAGE:
					// TODO: get shared object (there could be several)
					onSharedObjectSend(null, event.getKey(), (List) event.getValue());
					break;
			
				default:
					// TODO: this works in this context, but is not kosher, because it
					// may lead to a situation where there are other events than a SEND
					// event, which might lead to an infinite loop
					super.onSharedObject(conn, channel, source, object);
			}
		}
    }

	protected void onInvoke(RTMPConnection conn, Channel channel, Header source,
		Notify invoke, RTMP rtmp) {
		if (debug) {
			// final IServiceCall call = invoke.getCall();
			// System.out.println("invoke: " + call.getServiceMethodName());
		}
		super.onInvoke(conn, channel, source, invoke, rtmp);
	}

	// ISharedObjectListener protocol
	public void onSharedObjectClear(ISharedObjectBase so) {
	}

	public void onSharedObjectConnect(ISharedObjectBase so) {
	}

	public void onSharedObjectDelete(ISharedObjectBase so, String key) {
	}

	public void onSharedObjectDisconnect(ISharedObjectBase so) {
	}

	public void onSharedObjectSend(ISharedObjectBase so, String method, List params) {
	}

	public void onSharedObjectUpdate(ISharedObjectBase so, String key, Object value) {
	}

	public void onSharedObjectUpdate(ISharedObjectBase so, IAttributeStore values) {
	}

	public void onSharedObjectUpdate(ISharedObjectBase so, Map<String, Object> values) {
	}

}
