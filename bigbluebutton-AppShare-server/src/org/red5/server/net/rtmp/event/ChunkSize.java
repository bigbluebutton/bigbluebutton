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
 * Chunk size event.
 */
public class ChunkSize extends BaseEvent {
	
	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = -7680099175881755879L;
    
    /** Chunk size. */
	private int size;

	/**
	 * Instantiates a new chunk size.
	 */
	public ChunkSize() {
		super(Type.SYSTEM);
	}
    
    /**
     * Create chunk size event with given size.
     * 
     * @param size         Chunk size
     */
    public ChunkSize(int size) {
		this();
		this.size = size;
	}

	/** {@inheritDoc} */
    @Override
	public byte getDataType() {
		return TYPE_CHUNK_SIZE;
	}

	/**
	 * Getter for size.
	 * 
	 * @return  Chunk size
	 */
    public int getSize() {
		return size;
	}

	/**
	 * Setter for size.
	 * 
	 * @param size  Chunk size
	 */
    public void setSize(int size) {
		this.size = size;
	}

    /**
     * Releases chunk (set size to zero).
     */
    protected void doRelease() {
		size = 0;
	}

	/** {@inheritDoc} */
    @Override
	public String toString() {
		return "ChunkSize: " + size;
	}

	/** {@inheritDoc} */
    @Override
	public boolean equals(Object obj) {
		if (!(obj instanceof ChunkSize)) {
			return false;
		}
		final ChunkSize other = (ChunkSize) obj;
		return getSize() == other.getSize();
	}

	/** {@inheritDoc} */
    @Override
	protected void releaseInternal() {

	}

	/** {@inheritDoc} */
    @Override
	public int hashCode() {
		// XXX Paul: use timestamp as the hash instead of Object.hashCode()
		return timestamp;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.event.BaseEvent#readExternal(java.io.ObjectInput)
	 */
	@Override
	public void readExternal(ObjectInput in) throws IOException, ClassNotFoundException {
		super.readExternal(in);
		size = in.readInt();
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.event.BaseEvent#writeExternal(java.io.ObjectOutput)
	 */
	@Override
	public void writeExternal(ObjectOutput out) throws IOException {
		super.writeExternal(out);
		out.writeInt(size);
	}
}