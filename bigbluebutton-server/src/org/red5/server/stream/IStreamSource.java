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

import org.red5.server.api.event.IEvent;

// TODO: Auto-generated Javadoc
/**
 * Source for streams.
 */
public interface IStreamSource {
    
    /**
     * Is there something more to stream?.
     * 
     * @return      <code>true</code> if there's streamable data, <code>false</code> otherwise
     */
	public abstract boolean hasMore();

    /**
     * Double ended queue of event objects.
     * 
     * @return      Event from queue
     */
    public abstract IEvent dequeue();

    /**
     * Close stream source.
     */
	public abstract void close();

}
