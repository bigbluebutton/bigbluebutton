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

import java.lang.ref.WeakReference;

import org.red5.server.api.IBWControllable;
import org.red5.server.api.IBandwidthConfigure;
import org.red5.server.api.stream.IClientStream;
import org.red5.server.api.stream.IStreamCapableConnection;

// TODO: Auto-generated Javadoc
/**
 * Abstract base for client streams.
 */
public abstract class AbstractClientStream extends AbstractStream implements
		IClientStream {

    /** Stream identifier. Unique across server. */
    private int streamId;
    
    /** Connection that works with streams. */
	private WeakReference<IStreamCapableConnection> conn;
    
    /** Bandwidth configuration. */
	private IBandwidthConfigure bwConfig;
	
	/** Buffer duration in ms as requested by the client. */
	private int clientBufferDuration;

    /**
     * Return stream id.
     * 
     * @return           Stream id
     */
	public int getStreamId() {
		return streamId;
	}

    /**
     * Return connection associated with stream.
     * 
     * @return           Stream capable connection object
     */
	public IStreamCapableConnection getConnection() {
		return conn.get();
	}

    /**
     * Return stream bandwidth configuration.
     * 
     * @return            Bandwidth config
     */
	public IBandwidthConfigure getBandwidthConfigure() {
		return bwConfig;
	}

    /**
     * Setter for bandwidth config.
     * 
     * @param config              Bandwidth config
     */
	public void setBandwidthConfigure(IBandwidthConfigure config) {
		this.bwConfig = config;
	}

    /**
     * Return parent flow controllable object (bandwidth preferences holder).
     * 
     * @return          IFlowControllable object
     */
	public IBWControllable getParentBWControllable() {
		return conn.get();
	}

    /**
     * Setter for stream id.
     * 
     * @param streamId       Stream id
     */
	public void setStreamId(int streamId) {
		this.streamId = streamId;
	}

    /**
     * Setter for stream capable connection.
     * 
     * @param conn           IStreamCapableConnection object
     */
	public void setConnection(IStreamCapableConnection conn) {
		this.conn = new WeakReference<IStreamCapableConnection>(conn);
	}

	/** {@inheritDoc} */
	public void setClientBufferDuration(int duration) {
		clientBufferDuration = duration;
	}

	/**
	 * Get duration in ms as requested by the client.
	 * 
	 * @return the client buffer duration
	 */
	public int getClientBufferDuration() {
		return clientBufferDuration;
	}
	
	
	
}
