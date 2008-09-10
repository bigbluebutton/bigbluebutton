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
 * Bytes read event.
 */
public class BytesRead extends BaseEvent {
	
	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = -127649312402709338L;
    
    /** Bytes read. */
	private int bytesRead;
	
	/**
	 * Instantiates a new bytes read.
	 */
	public BytesRead() {
		super(Type.STREAM_CONTROL);
	}

    /**
     * Creates new event with given bytes number.
     * 
     * @param bytesRead       Number of bytes read
     */
    public BytesRead(int bytesRead) {
		this();
		this.bytesRead = bytesRead;
	}

	/** {@inheritDoc} */
    @Override
	public byte getDataType() {
		return TYPE_BYTES_READ;
	}

	/**
	 * Return number of bytes read.
	 * 
	 * @return  Number of bytes
	 */
    public int getBytesRead() {
		return bytesRead;
	}

	/**
	 * Setter for bytes read.
	 * 
	 * @param bytesRead  Number of bytes read
	 */
    public void setBytesRead(int bytesRead) {
		this.bytesRead = bytesRead;
	}

    /**
     * Release event (set bytes read to zero).
     */
    protected void doRelease() {
		bytesRead = 0;
	}

	/** {@inheritDoc} */
    @Override
	public String toString() {
		return "StreamBytesRead: " + bytesRead;
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
		bytesRead = in.readInt();
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.event.BaseEvent#writeExternal(java.io.ObjectOutput)
	 */
	@Override
	public void writeExternal(ObjectOutput out) throws IOException {
		super.writeExternal(out);
		out.writeInt(bytesRead);
	}
}