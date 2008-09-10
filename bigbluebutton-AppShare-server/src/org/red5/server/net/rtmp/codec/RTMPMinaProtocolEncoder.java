package org.red5.server.net.rtmp.codec;

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
import org.apache.mina.common.IoSession;
import org.apache.mina.filter.codec.ProtocolCodecException;
import org.apache.mina.filter.codec.ProtocolEncoder;
import org.apache.mina.filter.codec.ProtocolEncoderOutput;
import org.red5.server.net.protocol.ProtocolState;

// TODO: Auto-generated Javadoc
/**
 * Mina protocol encoder for RTMP.
 */
public class RTMPMinaProtocolEncoder extends RTMPProtocolEncoder implements
		ProtocolEncoder {

	/** {@inheritDoc} */
    public void encode(IoSession session, Object message,
			ProtocolEncoderOutput out) throws ProtocolCodecException {
		try {
			final ProtocolState state = (ProtocolState) session
					.getAttribute(ProtocolState.SESSION_KEY);
			// We need to synchronize on the output and flush the
			// generated data to prevent two packages to the same channel
			// to be sent in different order thus resulting in wrong
			// headers being generated.
			synchronized (out) {
				final ByteBuffer buf = encode(state, message);
				if (buf != null) {
					out.write(buf);
					out.mergeAll();
					out.flush();
				}
			}
		} catch (Exception ex) {
			log.error("{}", ex);
		}
	}

	/** {@inheritDoc} */
    public void dispose(IoSession ioSession) throws Exception {
		// TODO Auto-generated method stub		
	}
}
