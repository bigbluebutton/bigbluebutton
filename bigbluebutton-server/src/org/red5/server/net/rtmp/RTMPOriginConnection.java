package org.red5.server.net.rtmp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.mina.common.ByteBuffer;
import org.red5.server.api.scheduling.ISchedulingService;
import org.red5.server.net.mrtmp.IMRTMPConnection;
import org.red5.server.net.mrtmp.IMRTMPOriginManager;
import org.red5.server.net.mrtmp.OriginMRTMPHandler;
import org.red5.server.net.rtmp.codec.RTMP;
import org.red5.server.net.rtmp.message.Packet;

// TODO: Auto-generated Javadoc
/**
 * A pseudo-connection on Origin that represents a client
 * on Edge.
 * The connection is created behind a MRTMP connection so
 * no handshake job or keep-alive job is necessary. No raw byte
 * data write is needed either.
 * 
 * @author Steven Gong (steven.gong@gmail.com)
 * @version $Id$
 */
public class RTMPOriginConnection extends RTMPConnection {
	
	/** The Constant log. */
	private static final Logger log = LoggerFactory.getLogger(RTMPOriginConnection.class);
	
	/** The io session id. */
	private int ioSessionId;
	
	/** The mrtmp manager. */
	private IMRTMPOriginManager mrtmpManager;
	
	/** The handler. */
	private OriginMRTMPHandler handler;
	
	/** The state. */
	private RTMP state;

	/**
	 * Instantiates a new rTMP origin connection.
	 * 
	 * @param type the type
	 * @param clientId the client id
	 */
	public RTMPOriginConnection(String type, int clientId) {
		this(type, clientId, 0);
	}

	/**
	 * Instantiates a new rTMP origin connection.
	 * 
	 * @param type the type
	 * @param clientId the client id
	 * @param ioSessionId the io session id
	 */
	public RTMPOriginConnection(String type, int clientId, int ioSessionId) {
		super(type);
		setId(clientId);
		this.ioSessionId = ioSessionId;
		state = new RTMP(RTMP.MODE_SERVER);
		state.setState(RTMP.STATE_CONNECTED);
	}
	
	/**
	 * Gets the io session id.
	 * 
	 * @return the io session id
	 */
	public int getIoSessionId() {
		return ioSessionId;
	}

	/**
	 * Sets the mrtmp manager.
	 * 
	 * @param mrtmpManager the new mrtmp manager
	 */
	public void setMrtmpManager(IMRTMPOriginManager mrtmpManager) {
		this.mrtmpManager = mrtmpManager;
	}

	/**
	 * Sets the handler.
	 * 
	 * @param handler the new handler
	 */
	public void setHandler(OriginMRTMPHandler handler) {
		this.handler = handler;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.RTMPConnection#getState()
	 */
	public RTMP getState() {
		return state;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.RTMPConnection#onInactive()
	 */
	@Override
	protected void onInactive() {
		// Edge already tracks the activity
		// no need to do again here.
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.RTMPConnection#rawWrite(org.apache.mina.common.ByteBuffer)
	 */
	@Override
	public void rawWrite(ByteBuffer out) {
		// won't write any raw data on the wire
		// XXX should we throw exception here
		// to indicate an abnormal state ?
		log.warn("Erhhh... Raw write. Shouldn't be in here!");
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.RTMPConnection#write(org.red5.server.net.rtmp.message.Packet)
	 */
	@Override
	public void write(Packet packet) {
		IMRTMPConnection conn = mrtmpManager.lookupMRTMPConnection(this);
		if (conn == null) {
			// the connect is gone
			log.debug("Client " + getId() + " is gone!");
			return;
		}
		if (!type.equals(PERSISTENT)) {
			mrtmpManager.associate(this, conn);
		}
		log.debug("Origin writing packet to client " + getId() + ":" + packet.getMessage());
		conn.write(getId(), packet);
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.RTMPConnection#startRoundTripMeasurement()
	 */
	@Override
	public void startRoundTripMeasurement() {
		// Edge already tracks the RTT
		// no need to track RTT here.
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.RTMPConnection#startWaitForHandshake(org.red5.server.api.scheduling.ISchedulingService)
	 */
	@Override
	protected void startWaitForHandshake(ISchedulingService service) {
		// no handshake in MRTMP, simply ignore
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.RTMPConnection#close()
	 */
	@Override
	synchronized public void close() {
		if (state.getState() == RTMP.STATE_DISCONNECTED) {
			return;
		}
		IMRTMPConnection conn = mrtmpManager.lookupMRTMPConnection(this);
		if (conn != null) {
			conn.disconnect(getId());
		}
		handler.closeConnection(this);
	}
	
	/**
	 * Real close.
	 */
	synchronized public void realClose() {
		if (state.getState() != RTMP.STATE_DISCONNECTED) {
			state.setState(RTMP.STATE_DISCONNECTED);
			super.close();
		}
	}
}
