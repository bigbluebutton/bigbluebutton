package org.red5.server.net.rtmp.event;

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
import java.io.ObjectInput;
import java.io.ObjectOutput;
import org.apache.mina.common.ByteBuffer;
import org.red5.io.utils.HexDump;

// TODO: Auto-generated Javadoc
/**
 * Unknown event.
 */
public class Unknown extends BaseEvent {
	
	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = -1352770037962252975L;
    
    /** Event data. */
	protected ByteBuffer data;
    
    /** Type of data. */
	protected byte dataType;

	/**
	 * Instantiates a new unknown.
	 */
	public Unknown() {}
    
    /**
     * Create new unknown event with given data and data type.
     * 
     * @param dataType             Data type
     * @param data                 Event data
     */
    public Unknown(byte dataType, ByteBuffer data) {
		super(Type.SYSTEM);
		this.dataType = dataType;
		this.data = data;
	}

	/** {@inheritDoc} */
    @Override
	public byte getDataType() {
		return dataType;
	}

	/**
	 * Getter for data.
	 * 
	 * @return  Data
	 */
    public ByteBuffer getData() {
		return data;
	}

	/** {@inheritDoc} */
    @Override
	public String toString() {
		final ByteBuffer buf = getData();
		StringBuffer sb = new StringBuffer();
		sb.append("Size: " + buf.remaining());
		sb.append("Data:\n\n" + HexDump.formatHexDump(buf.getHexDump()));
		return sb.toString();
	}

	/** {@inheritDoc} */
    @Override
	protected void releaseInternal() {
		if (data != null) {
			data.release();
			data = null;
		}
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.event.BaseEvent#readExternal(java.io.ObjectInput)
	 */
	@Override
	public void readExternal(ObjectInput in) throws IOException, ClassNotFoundException {
		super.readExternal(in);
		dataType = in.readByte();
		byte[] byteBuf = (byte[]) in.readObject();
		if (byteBuf != null) {
			data = ByteBuffer.allocate(0);
			data.setAutoExpand(true);
			SerializeUtils.ByteArrayToByteBuffer(byteBuf, data);
		}
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.event.BaseEvent#writeExternal(java.io.ObjectOutput)
	 */
	@Override
	public void writeExternal(ObjectOutput out) throws IOException {
		super.writeExternal(out);
		out.writeByte(dataType);
		if (data != null) {
			out.writeObject(SerializeUtils.ByteBufferToByteArray(data));
		} else {
			out.writeObject(null);
		}
	}
}