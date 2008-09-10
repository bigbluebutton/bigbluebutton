package org.red5.server.net.rtmp.event;

import java.io.IOException;
import java.io.ObjectInput;
import java.io.ObjectOutput;
// TODO: Auto-generated Javadoc
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

/**
 * Server bandwidth event.
 */
public class ServerBW extends BaseEvent {
	
	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 24487902555977210L;
    
    /** Bandwidth. */
	private int bandwidth;

	/**
	 * Instantiates a new server bw.
	 */
	public ServerBW() {}
    
    /**
     * Server bandwidth event.
     * 
     * @param bandwidth      Bandwidth
     */
    public ServerBW(int bandwidth) {
		super(Type.STREAM_CONTROL);
		this.bandwidth = bandwidth;
	}

	/** {@inheritDoc} */
    @Override
	public byte getDataType() {
		return TYPE_SERVER_BANDWIDTH;
	}

	/**
	 * Getter for bandwidth.
	 * 
	 * @return  Bandwidth
	 */
    public int getBandwidth() {
		return bandwidth;
	}

	/**
	 * Setter for bandwidth.
	 * 
	 * @param bandwidth  New bandwidth.
	 */
    public void setBandwidth(int bandwidth) {
		this.bandwidth = bandwidth;
	}

	/** {@inheritDoc} */
    @Override
	public String toString() {
		return "ServerBW: " + bandwidth;
	}

	/** {@inheritDoc} */
    @Override
	protected void releaseInternal() {

	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.event.BaseEvent#readExternal(java.io.ObjectInput)
	 */
	@Override
	public void readExternal(ObjectInput in) throws IOException, ClassNotFoundException {
		super.readExternal(in);
		bandwidth = in.readInt();
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.event.BaseEvent#writeExternal(java.io.ObjectOutput)
	 */
	@Override
	public void writeExternal(ObjectOutput out) throws IOException {
		super.writeExternal(out);
		out.writeInt(bandwidth);
	}
}
