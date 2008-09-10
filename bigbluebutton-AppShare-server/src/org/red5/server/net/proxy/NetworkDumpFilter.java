package org.red5.server.net.proxy;

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

import java.nio.channels.WritableByteChannel;

import org.apache.mina.common.ByteBuffer;
import org.apache.mina.common.IoFilterAdapter;
import org.apache.mina.common.IoSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Network dump filter, performs raw data and headers dump on message recieve.
 */
public class NetworkDumpFilter extends IoFilterAdapter {
    
    /** Logger. */
	protected static Logger log = LoggerFactory.getLogger(ProxyFilter.class);

    /** Raw data byte channel. */
    protected WritableByteChannel raw;

    /** Headers byte channel. */
    protected WritableByteChannel headers;

    /**
     * Create network dump filter from given dump channels.
     * 
     * @param headers           Channel to dump headers
     * @param raw               Channel to dump raw data
     */
    public NetworkDumpFilter(WritableByteChannel headers,
			WritableByteChannel raw) {
		this.raw = raw;
		this.headers = headers;
	}

	/** {@inheritDoc} */
    @Override
	public void messageReceived(NextFilter next, IoSession session,
			Object message) throws Exception {
		if (message instanceof ByteBuffer) {
			ByteBuffer out = (ByteBuffer) message;
			if (headers != null) {
				ByteBuffer header = ByteBuffer.allocate(12);
				header.putLong(System.currentTimeMillis());
				header.putInt(out.limit() - out.position());
				header.flip();
				headers.write(header.buf());
			}
			if (raw != null) {
				raw.write(out.asReadOnlyBuffer().buf());
			}
		}
		next.messageReceived(session, message);
	}

	/** {@inheritDoc} */
    @Override
	public void sessionClosed(NextFilter next, IoSession session)
			throws Exception {
		if (headers.isOpen()) {
			headers.close();
		}
		if (raw.isOpen()) {
			raw.close();
		}
		next.sessionClosed(session);
	}

}
