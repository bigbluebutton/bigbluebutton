package org.red5.server.stream.provider;

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

import org.red5.server.messaging.IMessageComponent;
import org.red5.server.messaging.IPipe;
import org.red5.server.messaging.IPipeConnectionListener;
import org.red5.server.messaging.IProvider;
import org.red5.server.messaging.OOBControlMessage;
import org.red5.server.messaging.PipeConnectionEvent;

// TODO: Auto-generated Javadoc
/**
 * Provides connection via pipe.
 */
public class ConnectionProvider implements IProvider, IPipeConnectionListener {
    
    /** Pipe used by connection. */
    private IPipe pipe;

	/** {@inheritDoc} */
    public void onOOBControlMessage(IMessageComponent source, IPipe pipe,
			OOBControlMessage oobCtrlMsg) {
		// TODO Auto-generated method stub

	}

	/** {@inheritDoc} */
    public void onPipeConnectionEvent(PipeConnectionEvent event) {
		switch (event.getType()) {
			case PipeConnectionEvent.PROVIDER_CONNECT_PUSH:
				if (event.getProvider() == this) {
					this.pipe = (IPipe) event.getSource();
				}
				break;
			case PipeConnectionEvent.PROVIDER_DISCONNECT:
				if (this.pipe == event.getSource()) {
					this.pipe = null;
				}
				break;
			default:
				break;
		}
	}

}
