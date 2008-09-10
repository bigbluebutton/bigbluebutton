package org.red5.server.messaging;

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

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * A simple in-memory version of push-push pipe.
 * It is triggered by an active provider to push messages
 * through it to an event-driven consumer.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Steven Gong (steven.gong@gmail.com)
 */
public class InMemoryPushPushPipe extends AbstractPipe {
	
	/** The Constant log. */
	private static final Logger log = LoggerFactory.getLogger(InMemoryPushPushPipe.class);

	/** {@inheritDoc} */
    @Override
	public boolean subscribe(IConsumer consumer, Map paramMap) {
		if (!(consumer instanceof IPushableConsumer)) {
			throw new IllegalArgumentException(
					"Non-pushable consumer not supported by PushPushPipe");
		}
		boolean success = super.subscribe(consumer, paramMap);
		if (success) {
			fireConsumerConnectionEvent(consumer,
					PipeConnectionEvent.CONSUMER_CONNECT_PUSH, paramMap);
		}
		return success;
	}

	/** {@inheritDoc} */
    @Override
	public boolean subscribe(IProvider provider, Map paramMap) {
		boolean success = super.subscribe(provider, paramMap);
		if (success) {
			fireProviderConnectionEvent(provider,
					PipeConnectionEvent.PROVIDER_CONNECT_PUSH, paramMap);
		}
		return success;
	}

	/** {@inheritDoc} */
    public IMessage pullMessage() {
		return null;
	}

	/** {@inheritDoc} */
    public IMessage pullMessage(long wait) {
		return null;
	}

	/**
	 * Pushes a message out to all the PushableConsumers.
	 * 
	 * @param message the message
	 * 
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
    public void pushMessage(IMessage message) throws IOException {
		for (IConsumer consumer : consumers) {
			try {
				((IPushableConsumer) consumer).pushMessage(this, message);
			} catch (Throwable t) {
				if (t instanceof IOException) {
					// Pass this along
					throw (IOException) t;
				}
				log.error("exception when pushing message to consumer", t);
			}
		}
	}
}
