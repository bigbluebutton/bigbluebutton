package org.red5.server.net.mrtmp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.mina.common.IoHandlerAdapter;
import org.apache.mina.common.IoSession;
import org.apache.mina.filter.LoggingFilter;
import org.apache.mina.filter.codec.ProtocolCodecFactory;
import org.apache.mina.filter.codec.ProtocolCodecFilter;
import org.red5.server.net.mrtmp.MRTMPPacket.RTMPBody;
import org.red5.server.net.mrtmp.MRTMPPacket.RTMPHeader;
import org.red5.server.net.rtmp.IRTMPConnManager;
import org.red5.server.net.rtmp.RTMPConnection;
import org.red5.server.net.rtmp.codec.RTMP;
import org.red5.server.net.rtmp.event.Invoke;
import org.red5.server.net.rtmp.message.Constants;
import org.red5.server.service.Call;

// TODO: Auto-generated Javadoc
/**
 * The Class EdgeMRTMPHandler.
 */
public class EdgeMRTMPHandler extends IoHandlerAdapter
implements Constants {
	
	/** The Constant log. */
	private static final Logger log = LoggerFactory.getLogger(EdgeMRTMPHandler.class);

	/** The rtmp conn manager. */
	private IRTMPConnManager rtmpConnManager;
	
	/** The mrtmp manager. */
	private IMRTMPEdgeManager mrtmpManager;
	
	/** The codec factory. */
	private ProtocolCodecFactory codecFactory;
	
	/**
	 * Sets the codec factory.
	 * 
	 * @param codecFactory the new codec factory
	 */
	public void setCodecFactory(ProtocolCodecFactory codecFactory) {
		this.codecFactory = codecFactory;
	}

	/**
	 * Sets the mrtmp manager.
	 * 
	 * @param mrtmpManager the new mrtmp manager
	 */
	public void setMrtmpManager(IMRTMPEdgeManager mrtmpManager) {
		this.mrtmpManager = mrtmpManager;
	}

	/**
	 * Sets the rtmp conn manager.
	 * 
	 * @param rtmpConnManager the new rtmp conn manager
	 */
	public void setRtmpConnManager(IRTMPConnManager rtmpConnManager) {
		this.rtmpConnManager = rtmpConnManager;
	}

	/* (non-Javadoc)
	 * @see org.apache.mina.common.IoHandlerAdapter#messageReceived(org.apache.mina.common.IoSession, java.lang.Object)
	 */
	@Override
	public void messageReceived(IoSession session, Object message) throws Exception {
		MRTMPPacket mrtmpPacket = (MRTMPPacket) message;
		int clientId = mrtmpPacket.getHeader().getClientId();
		RTMPConnection conn = rtmpConnManager.getConnection(clientId);
		if (conn == null) {
			log.debug("Client " + clientId + " is already closed.");
			return;
		}
		RTMP rtmpState = conn.getState();
		switch (mrtmpPacket.getHeader().getType()) {
			case MRTMPPacket.CLOSE:
				synchronized (rtmpState) {
					rtmpState.setState(RTMP.STATE_EDGE_DISCONNECTING);
				}
				conn.close();
				break;
			case MRTMPPacket.RTMP:
				RTMPHeader rtmpHeader = (RTMPHeader) mrtmpPacket.getHeader();
				RTMPBody rtmpBody = (RTMPBody) mrtmpPacket.getBody();
				boolean toDisconnect = false;
				synchronized (rtmpState) {
					if (rtmpState.getState() == RTMP.STATE_ORIGIN_CONNECT_FORWARDED &&
							rtmpHeader.getRtmpType() == TYPE_INVOKE) {
						// we got the connect invocation result from Origin
						// parse the result
						Invoke invoke = (Invoke) rtmpBody.getRtmpPacket().getMessage();
						if ("connect".equals(invoke.getCall().getServiceMethodName())) {
							if (invoke.getCall().getStatus() == Call.STATUS_SUCCESS_RESULT) {
								rtmpState.setState(RTMP.STATE_CONNECTED);
							} else {
								// TODO set EdgeRTMP state to closing ?
								toDisconnect = true;
							}
						}
					}
				}
				log.debug("Forward packet to client: {}", rtmpBody.getRtmpPacket().getMessage());
				// send the packet back to client
				conn.write(rtmpBody.getRtmpPacket());
				if (toDisconnect) {
					conn.close();
				}
				synchronized (rtmpState) {
					if (rtmpState.getState() == RTMP.STATE_CONNECTED) {
						conn.startRoundTripMeasurement();
					}
				}
				break;
			default:
				break;
		}
	}

	/* (non-Javadoc)
	 * @see org.apache.mina.common.IoHandlerAdapter#messageSent(org.apache.mina.common.IoSession, java.lang.Object)
	 */
	@Override
	public void messageSent(IoSession session, Object message) throws Exception {
		// do nothing
	}

	/* (non-Javadoc)
	 * @see org.apache.mina.common.IoHandlerAdapter#sessionClosed(org.apache.mina.common.IoSession)
	 */
	@Override
	public void sessionClosed(IoSession session) throws Exception {
		MRTMPEdgeConnection conn = (MRTMPEdgeConnection) session.getAttachment();
		mrtmpManager.unregisterConnection(conn);
		conn.close();
		log.debug("Closed MRTMP Edge Connection " + conn);
	}

	/* (non-Javadoc)
	 * @see org.apache.mina.common.IoHandlerAdapter#sessionCreated(org.apache.mina.common.IoSession)
	 */
	@Override
	public void sessionCreated(IoSession session) throws Exception {
		MRTMPEdgeConnection conn = new MRTMPEdgeConnection();
		conn.setIoSession(session);
		mrtmpManager.registerConnection(conn);
		session.setAttachment(conn);
		session.getFilterChain().addFirst("protocolFilter",
				new ProtocolCodecFilter(this.codecFactory));
		if (log.isDebugEnabled()) {
			session.getFilterChain().addLast("logger", new LoggingFilter());
		}
		log.debug("Created MRTMP Edge Connection " + conn);
	}
}
