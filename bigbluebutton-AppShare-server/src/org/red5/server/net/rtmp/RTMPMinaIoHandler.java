package org.red5.server.net.rtmp;

/*
 * RED5 Open Source Flash Server - http://www.osflash.org/red5
 * 
 * Copyright (c) 2006-2007 by respective authors (see below). All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 2.1 of the License, or (at your option) any later 
 * version. 
 * 
 * This library is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with this library; if not, write to the Free Software Foundation, Inc., 
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 */

import org.apache.mina.common.ByteBuffer;
import org.apache.mina.common.IoHandlerAdapter;
import org.apache.mina.common.IoSession;
import org.apache.mina.filter.LoggingFilter;
import org.apache.mina.filter.codec.ProtocolCodecFactory;
import org.apache.mina.filter.codec.ProtocolCodecFilter;
import org.red5.server.net.protocol.ProtocolState;
import org.red5.server.net.rtmp.codec.RTMP;
import org.red5.server.net.rtmp.message.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;

// TODO: Auto-generated Javadoc
/**
 * Handles all RTMP protocol events fired by the MINA framework.
 */
public class RTMPMinaIoHandler extends IoHandlerAdapter
implements ApplicationContextAware {
    
    /** Logger. */
	protected static Logger log = LoggerFactory.getLogger(RTMPMinaIoHandler.class);

    /** RTMP events handler. */
    protected IRTMPHandler handler;
    
    /** Mode. */
    protected boolean mode = RTMP.MODE_SERVER;
    
    /** Application context. */
	protected ApplicationContext appCtx;

    /** RTMP protocol codec factory. */
    private ProtocolCodecFactory codecFactory = null;
    
    /** The rtmp conn manager. */
    private IRTMPConnManager rtmpConnManager;

    /**
     * Setter for handler.
     * 
     * @param handler  RTMP events handler
     */
    public void setHandler(IRTMPHandler handler) {
		this.handler = handler;
	}
	
	/**
	 * Setter for mode.
	 * 
	 * @param mode     <code>true</code> if handler should work in server mode, <code>false</code> otherwise
	 */
    public void setMode(boolean mode) {
		this.mode = mode;
	}

	/**
	 * Setter for codec factory.
	 * 
	 * @param codecFactory  RTMP protocol codec factory
	 */
    public void setCodecFactory(ProtocolCodecFactory codecFactory) {
		this.codecFactory = codecFactory;
	}
    
	/**
	 * Sets the rtmp conn manager.
	 * 
	 * @param rtmpConnManager the new rtmp conn manager
	 */
	public void setRtmpConnManager(IRTMPConnManager rtmpConnManager) {
		this.rtmpConnManager = rtmpConnManager;
	}

	//	 ------------------------------------------------------------------------------

	/** {@inheritDoc} */
    @Override
	public void exceptionCaught(IoSession session, Throwable cause)
			throws Exception {
   		log.debug("Exception caught {}", cause);
	}

	/** {@inheritDoc} */
    @Override
	public void messageReceived(IoSession session, Object in) throws Exception {
    	if (log.isDebugEnabled()) {
    		log.debug("messageRecieved");
    	}
		final ProtocolState state = (ProtocolState) session.getAttribute(ProtocolState.SESSION_KEY);
		if (in instanceof ByteBuffer) {
			rawBufferRecieved(state, (ByteBuffer) in, session);
			return;
		}
		final RTMPMinaConnection conn = (RTMPMinaConnection) session.getAttachment();
		handler.messageReceived(conn, state, in);
	}

    /**
     * Handle raw buffer receiving event.
     * 
     * @param state        Protocol state
     * @param in           Data buffer
     * @param session      I/O session, that is, connection between two endpoints
     */
    protected void rawBufferRecieved(ProtocolState state, ByteBuffer in,
			IoSession session) {

		final RTMP rtmp = (RTMP) state;
		if (rtmp.getMode() == RTMP.MODE_SERVER) {
			if (rtmp.getState() != RTMP.STATE_HANDSHAKE) {
				log.warn("Raw buffer after handshake, something odd going on");
			}
			log.debug("Handshake 2nd phase - size: {}", in.remaining());
			ByteBuffer out = ByteBuffer.allocate((Constants.HANDSHAKE_SIZE*2)+1);
			out.put((byte)0x03);
			// TODO: the first four bytes of the handshake reply seem to be the
			//       server uptime - send something better here...
			out.putInt(0x01);
			out.fill((byte)0x00,Constants.HANDSHAKE_SIZE-4);
			out.put(in);
			out.flip();
			// Skip first 8 bytes when comparing the handshake, they seem to
			// be changed when connecting from a Mac client.
			rtmp.setHandshake(out, 9, Constants.HANDSHAKE_SIZE-8);
			//in.release();
			session.write(out); 
		} else {
			log.debug("Handshake 3d phase - size: {}", in.remaining());
			in.skip(1);
			ByteBuffer out = ByteBuffer.allocate(Constants.HANDSHAKE_SIZE);
			int limit=in.limit();
			in.limit(in.position()+Constants.HANDSHAKE_SIZE);
			out.put(in); 
			out.flip();
			in.limit(limit);
			in.skip(Constants.HANDSHAKE_SIZE);
			session.write(out);
		}
	}

	/** {@inheritDoc} */
    @Override
	public void messageSent(IoSession session, Object message) throws Exception {
    	if (log.isDebugEnabled()) {
    		log.debug("messageSent");
    	}
		session.getAttribute(ProtocolState.SESSION_KEY);
		final RTMPMinaConnection conn = (RTMPMinaConnection) session
				.getAttachment();
		handler.messageSent(conn, message);
		if (mode == RTMP.MODE_CLIENT) {
			if (message instanceof ByteBuffer) {
				if (((ByteBuffer)message).limit() == Constants.HANDSHAKE_SIZE) {
					handler.connectionOpened((RTMPMinaConnection)session.getAttachment(), (RTMP)session.getAttribute(ProtocolState.SESSION_KEY));
				}
			}
		}
	}

	/** {@inheritDoc} */
    @Override
	public void sessionOpened(IoSession session) throws Exception {   	
		super.sessionOpened(session);

		RTMP rtmp=(RTMP)session.getAttribute(ProtocolState.SESSION_KEY);
		if (rtmp.getMode()==RTMP.MODE_CLIENT) {
			if (log.isDebugEnabled()){
				log.debug("Handshake 1st phase");
			}
			ByteBuffer out = ByteBuffer.allocate(Constants.HANDSHAKE_SIZE+1);
			out.put((byte)0x03);
			out.fill((byte)0x00,Constants.HANDSHAKE_SIZE);
			out.flip();
			session.write(out);
		} else {
			final RTMPMinaConnection conn = (RTMPMinaConnection) session.getAttachment();
			handler.connectionOpened(conn, rtmp);
		}
	}

	/** {@inheritDoc} */
    @Override
	public void sessionClosed(IoSession session) throws Exception {
		ByteBuffer buf = (ByteBuffer) session.getAttribute("buffer");
		if (buf != null) {
			buf.release();
		}
		final RTMP rtmp = (RTMP) session
				.getAttribute(ProtocolState.SESSION_KEY);
		final RTMPMinaConnection conn = (RTMPMinaConnection) session
				.getAttachment();
		this.handler.connectionClosed(conn, rtmp);
		session.removeAttribute(ProtocolState.SESSION_KEY);
		session.setAttachment(null);
	}

	/** {@inheritDoc} */
    @Override
	public void sessionCreated(IoSession session) throws Exception {
		if (log.isDebugEnabled()) {
			log.debug("Session created");
		}
		// moved protocol state from connection object to RTMP object
		RTMP rtmp = new RTMP(mode);
		session.setAttribute(ProtocolState.SESSION_KEY, rtmp);
		session.getFilterChain().addFirst("protocolFilter",
				new ProtocolCodecFilter(this.codecFactory));
		if (log.isDebugEnabled()) {
			session.getFilterChain().addLast("logger", new LoggingFilter());
		}
		RTMPMinaConnection conn = createRTMPMinaConnection();
		conn.setIoSession(session);
		conn.setState(rtmp);
		session.setAttachment(conn);
	}

	/** {@inheritDoc} */
    public void setApplicationContext(ApplicationContext appCtx) throws BeansException {
		this.appCtx = appCtx;
	}

    /**
     * Creates the rtmp mina connection.
     * 
     * @return the rTMP mina connection
     */
    protected RTMPMinaConnection createRTMPMinaConnection() {
    	return (RTMPMinaConnection) rtmpConnManager.createConnection(RTMPMinaConnection.class);
    }
}