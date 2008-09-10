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
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * A simple in-memory version of pull-pull pipe.
 * It is triggered by an active consumer that pulls messages
 * through it from a pullable provider.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Steven Gong (steven.gong@gmail.com)
 */
public class InMemoryPullPullPipe extends AbstractPipe {
	
	/** The Constant log. */
	private static final Logger log = LoggerFactory.getLogger(InMemoryPullPullPipe.class);

    /** {@inheritDoc} */
    @Override
	public boolean subscribe(IConsumer consumer, Map paramMap) {
		boolean success = super.subscribe(consumer, paramMap);
		if (success) {
			fireConsumerConnectionEvent(consumer,
					PipeConnectionEvent.CONSUMER_CONNECT_PULL, paramMap);
		}
		return success;
	}

	/** {@inheritDoc} */
    @Override
	public boolean subscribe(IProvider provider, Map paramMap) {
		if (!(provider instanceof IPullableProvider)) {
			throw new IllegalArgumentException(
					"Non-pullable provider not supported by PullPullPipe");
		}
		boolean success = super.subscribe(provider, paramMap);
		if (success) {
			fireProviderConnectionEvent(provider,
					PipeConnectionEvent.PROVIDER_CONNECT_PULL, paramMap);
		}
		return success;
	}

	/** {@inheritDoc} */
    public IMessage pullMessage() throws IOException {
		IMessage message = null;
		for (IProvider provider : providers) {
			if (!(provider instanceof IPullableProvider))
				continue;
			
			// choose the first available provider
			try {
				message = ((IPullableProvider) provider).pullMessage(this);
				if (message != null) {
					break;
				}
			} catch (Throwable t) {
				if (t instanceof IOException)
					// Pass this along
					throw (IOException) t;
				log.error("exception when pulling message from provider", t);
			}
		}
		return message;
	}

	/** {@inheritDoc} */
    public IMessage pullMessage(long wait) {
		IMessage message = null;
		// divided evenly
		int size = providers.size();
		long averageWait = size > 0 ? wait / size : 0;
		// choose the first available provider
		for (IProvider provider : providers) {
			if (!(provider instanceof IPullableProvider))
				continue;
			
			try {
				message = ((IPullableProvider) provider).pullMessage(this, averageWait);
				if (message != null) {
					break;
				}
			} catch (Throwable t) {
				log.error("exception when pulling message from provider", t);
			}
		}
		return message;
	}

	/** {@inheritDoc} */
    public void pushMessage(IMessage message) {
		// push mode ignored
	}

}
