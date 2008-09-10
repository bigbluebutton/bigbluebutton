package org.red5.server.net.rtmp;

import java.util.Map;

import org.apache.mina.common.ByteBuffer;
import org.red5.server.api.IConnection.Encoding;
import org.red5.server.api.service.IPendingServiceCall;
import org.red5.server.api.service.IServiceCall;
import org.red5.server.net.mrtmp.IMRTMPConnection;
import org.red5.server.net.mrtmp.IMRTMPManager;
import org.red5.server.net.protocol.ProtocolState;
import org.red5.server.net.rtmp.codec.RTMP;
import org.red5.server.net.rtmp.event.BytesRead;
import org.red5.server.net.rtmp.event.IRTMPEvent;
import org.red5.server.net.rtmp.event.Invoke;
import org.red5.server.net.rtmp.event.Ping;
import org.red5.server.net.rtmp.event.Unknown;
import org.red5.server.net.rtmp.message.Header;
import org.red5.server.net.rtmp.message.Packet;
import org.red5.server.service.Call;

// TODO: Auto-generated Javadoc
/**
 * The Class EdgeRTMPHandler.
 */
public class EdgeRTMPHandler extends RTMPHandler {
	
	/** The mrtmp manager. */
	private IMRTMPManager mrtmpManager;
	
	/**
	 * Sets the mRTMP manager.
	 * 
	 * @param mrtmpManager the new mRTMP manager
	 */
	public void setMRTMPManager(IMRTMPManager mrtmpManager) {
		this.mrtmpManager = mrtmpManager;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.BaseRTMPHandler#messageReceived(org.red5.server.net.rtmp.RTMPConnection, org.red5.server.net.protocol.ProtocolState, java.lang.Object)
	 */
	@Override
	public void messageReceived(RTMPConnection conn, ProtocolState state, Object in) throws Exception {
		IRTMPEvent message = null;
		final Packet packet = (Packet) in;
		message = packet.getMessage();
		final Header header = packet.getHeader();
		final Channel channel = conn.getChannel(header.getChannelId());

		// Increase number of received messages
		conn.messageReceived();

		if (header.getDataType() == TYPE_BYTES_READ) {
			// TODO need to sync the bytes read on edge and origin
			onStreamBytesRead(conn, channel, header,
					(BytesRead) message);
		}

		if (header.getDataType() == TYPE_INVOKE) {
			final IServiceCall call = ((Invoke) message).getCall();
			final String action = call.getServiceMethodName();
			if (call.getServiceName() == null &&
					!conn.isConnected() &&
					action.equals(ACTION_CONNECT)) {
				handleConnect(conn, channel, header, (Invoke) message, (RTMP) state);
				return;
			}
		}

		switch (header.getDataType()) {
			case TYPE_CHUNK_SIZE:
			case TYPE_INVOKE:
			case TYPE_FLEX_MESSAGE:
			case TYPE_NOTIFY:
			case TYPE_AUDIO_DATA:
			case TYPE_VIDEO_DATA:
			case TYPE_FLEX_SHARED_OBJECT:
			case TYPE_SHARED_OBJECT:
			case TYPE_BYTES_READ:
				forwardPacket(conn, packet);
				break;
			case TYPE_PING:
				onPing(conn, channel, header, (Ping) message);
				break;

			default:
				if (log.isDebugEnabled()) {
					log.debug("Unknown type: "+header.getDataType());
				}
		}
		if (message instanceof Unknown) {
			log.info(message.toString());
		}
		if (message != null) {
			message.release();
		}		
	}
	
    /* (non-Javadoc)
     * @see org.red5.server.net.rtmp.BaseRTMPHandler#messageSent(org.red5.server.net.rtmp.RTMPConnection, java.lang.Object)
     */
    public void messageSent(RTMPConnection conn, Object message) {
		if (log.isDebugEnabled()) {
			log.debug("Message sent");
		}

		if (message instanceof ByteBuffer) {
			return;
		}

		// Increase number of sent messages
		conn.messageSent((Packet) message);
	}
	
    /**
     * Pass through all Ping events to origin except ping/pong.
     * 
     * @param conn the conn
     * @param channel the channel
     * @param source the source
     * @param ping the ping
     */
	protected void onPing(RTMPConnection conn, Channel channel, Header source,
			Ping ping) {
		switch (ping.getValue1()) {
			case Ping.PONG_SERVER:
				// This is the response to an IConnection.ping request
				conn.pingReceived(ping);
				break;
			default:
				// forward other to origin
				Packet p = new Packet(source);
				p.setMessage(ping);
				forwardPacket(conn, p);
		}
	}

	/**
	 * Handle connect.
	 * 
	 * @param conn the conn
	 * @param channel the channel
	 * @param header the header
	 * @param invoke the invoke
	 * @param rtmp the rtmp
	 */
	protected void handleConnect(RTMPConnection conn, Channel channel, Header header,
			Invoke invoke, RTMP rtmp) {
		final IServiceCall call = invoke.getCall();
        // Get parameters passed from client to NetConnection#connection
        final Map params = invoke.getConnectionParams();

        // Get hostname
        String host = getHostname((String) params.get("tcUrl"));

        // Check up port
        if (host.endsWith(":1935")) {
			// Remove default port from connection string
			host = host.substring(0, host.length() - 5);
		}

        // App name as path, but without query string if there is one
        String path = (String) params.get("app");
        if (path.indexOf("?") != -1){
        	int idx = path.indexOf("?");
        	params.put("queryString", path.substring(idx));
        	path = path.substring(0, idx);
        }
        params.put("path", path);
        
		final String sessionId = null;
		
		conn.setup(host, path, sessionId, params);
		
		// check the security constraints
		// send back "ConnectionRejected" if fails.
		if (!checkPermission(conn)) {
			call.setStatus(Call.STATUS_ACCESS_DENIED);
			if (call instanceof IPendingServiceCall) {
				IPendingServiceCall pc = (IPendingServiceCall) call;
				pc.setResult(getStatus(NC_CONNECT_REJECTED));
			}
			Invoke reply = new Invoke();
			reply.setCall(call);
			reply.setInvokeId(invoke.getInvokeId());
			channel.write(reply);
			conn.close();
		} else {
			synchronized (rtmp) {
				// connect the origin
				sendConnectMessage(conn);
				rtmp.setState(RTMP.STATE_EDGE_CONNECT_ORIGIN_SENT);
				Packet packet = new Packet(header);
				packet.setMessage(invoke);
				forwardPacket(conn, packet);
				rtmp.setState(RTMP.STATE_ORIGIN_CONNECT_FORWARDED);
				// Evaluate request for AMF3 encoding
				if (Integer.valueOf(3).equals(params.get("objectEncoding"))
						&& call instanceof IPendingServiceCall) {
					rtmp.setEncoding(Encoding.AMF3);
				}
			}
		}
	}

	/**
	 * Check permission.
	 * 
	 * @param conn the conn
	 * 
	 * @return true, if successful
	 */
	protected boolean checkPermission(RTMPConnection conn) {
		// TODO check permission per some rules
		return true;
	}
	
	/**
	 * Send connect message.
	 * 
	 * @param conn the conn
	 */
	protected void sendConnectMessage(RTMPConnection conn) {
		IMRTMPConnection mrtmpConn = mrtmpManager.lookupMRTMPConnection(conn);
		if (mrtmpConn != null) {
			mrtmpConn.connect(conn.getId());
		}
	}
	
	/**
	 * Forward packet.
	 * 
	 * @param conn the conn
	 * @param packet the packet
	 */
	protected void forwardPacket(RTMPConnection conn, Packet packet) {
		IMRTMPConnection mrtmpConn = mrtmpManager.lookupMRTMPConnection(conn);
		if (mrtmpConn != null) {
			mrtmpManager.lookupMRTMPConnection(conn).write(conn.getId(), packet);
		}
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.BaseRTMPHandler#connectionClosed(org.red5.server.net.rtmp.RTMPConnection, org.red5.server.net.rtmp.codec.RTMP)
	 */
	@Override
	public void connectionClosed(RTMPConnection conn, RTMP state) {
		// the state change will be maintained inside connection object.
		conn.close();
	}
}
