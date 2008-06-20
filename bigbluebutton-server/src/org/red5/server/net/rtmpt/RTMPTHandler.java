package org.red5.server.net.rtmpt;

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
import org.red5.server.net.protocol.ProtocolState;
import org.red5.server.net.protocol.SimpleProtocolCodecFactory;
import org.red5.server.net.rtmp.RTMPConnection;
import org.red5.server.net.rtmp.RTMPHandler;
import org.red5.server.net.rtmp.codec.RTMP;
import org.red5.server.net.rtmp.message.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Handler for RTMPT messages.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public class RTMPTHandler extends RTMPHandler {

    /** Logger. */
    protected static Logger log = LoggerFactory.getLogger(RTMPTHandler.class);

    /** Handler constant. */
    public static final String HANDLER_ATTRIBUTE = "red5.RMPTHandler";

    /** Protocol codec factory. */
    protected SimpleProtocolCodecFactory codecFactory;

	/**
	 * Setter for codec factory.
	 * 
	 * @param factory  Codec factory to use
	 */
    public void setCodecFactory(SimpleProtocolCodecFactory factory) {
		this.codecFactory = factory;
	}

	/**
	 * Getter for codec factory.
	 * 
	 * @return Codec factory
	 */
    public SimpleProtocolCodecFactory getCodecFactory() {
		return this.codecFactory;
	}

    /**
     * Handle raw buffer reciept.
     * 
     * @param conn        RTMP connection
     * @param state       Protocol state
     * @param in          Byte buffer with input raw data
     */
    private void rawBufferRecieved(RTMPConnection conn, ProtocolState state,
			ByteBuffer in) {
		final RTMP rtmp = (RTMP) state;

		if (rtmp.getState() != RTMP.STATE_HANDSHAKE) {
			log.warn("Raw buffer after handshake, something odd going on");
		}

		ByteBuffer out = ByteBuffer
				.allocate((Constants.HANDSHAKE_SIZE * 2) + 1);

		if (log.isDebugEnabled()) {
			log.debug("Writing handshake reply");
			log.debug("handskake size:" + in.remaining());
		}

		out.put((byte) 0x03);
		// TODO: the first four bytes of the handshake reply seem to be the
		//       server uptime - send something better here...
		out.putInt(0x01);
		out.fill((byte) 0x00, Constants.HANDSHAKE_SIZE-4);
		out.put(in).flip();
		// Skip first 8 bytes when comparing the handshake, they seem to
		// be changed when connecting from a Mac client.
		rtmp.setHandshake(out, 9, Constants.HANDSHAKE_SIZE-8);

		conn.rawWrite(out);
	}

	/** {@inheritDoc} */
    @Override
	public void messageReceived(RTMPConnection conn, ProtocolState state,
			Object in) throws Exception {
		if (in instanceof ByteBuffer) {
			rawBufferRecieved(conn, state, (ByteBuffer) in);
			((ByteBuffer) in).release();
			in = null;
		} else {
			super.messageReceived(conn, state, in);
		}
	}
}
