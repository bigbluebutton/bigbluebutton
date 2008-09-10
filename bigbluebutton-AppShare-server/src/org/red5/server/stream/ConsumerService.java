package org.red5.server.stream;

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

import org.red5.server.api.stream.IClientStream;
import org.red5.server.api.stream.IStreamCapableConnection;
import org.red5.server.messaging.IMessageOutput;
import org.red5.server.messaging.IPipe;
import org.red5.server.messaging.InMemoryPushPushPipe;
import org.red5.server.net.rtmp.RTMPConnection;
import org.red5.server.stream.consumer.ConnectionConsumer;

// TODO: Auto-generated Javadoc
/**
 * Basic consumer service implementation. Used to get pushed messages at consumer endpoint.
 */
public class ConsumerService implements IConsumerService {

	/** {@inheritDoc} */
    public IMessageOutput getConsumerOutput(IClientStream stream) {
		IStreamCapableConnection streamConn = stream.getConnection();
		if (streamConn == null || !(streamConn instanceof RTMPConnection)) {
			return null;
		}
		RTMPConnection conn = (RTMPConnection) streamConn;
		// TODO Better manage channels.
		// now we use OutputStream as a channel wrapper.
		OutputStream o = conn.createOutputStream(stream.getStreamId());
		IPipe pipe = new InMemoryPushPushPipe();
		pipe.subscribe(new ConnectionConsumer(conn, o.getVideo().getId(), o
				.getAudio().getId(), o.getData().getId()), null);
		return pipe;
	}

}
