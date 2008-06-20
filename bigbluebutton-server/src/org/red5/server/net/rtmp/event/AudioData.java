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
import org.red5.server.api.stream.IStreamPacket;
import org.red5.server.stream.IStreamData;

// TODO: Auto-generated Javadoc
/**
 * The Class AudioData.
 */
public class AudioData extends BaseEvent implements IStreamData, IStreamPacket {
	
	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = -4102940670913999407L;
	
	/** The data. */
	protected ByteBuffer data;

	/**
	 * Constructs a new AudioData.
	 */
    public AudioData() {
		this(ByteBuffer.allocate(0).flip());
	}

	/**
	 * Instantiates a new audio data.
	 * 
	 * @param data the data
	 */
	public AudioData(ByteBuffer data) {
		super(Type.STREAM_DATA);
		this.data = data;
	}

	/** {@inheritDoc} */
    @Override
	public byte getDataType() {
		return TYPE_AUDIO_DATA;
	}

	/** {@inheritDoc} */
    public ByteBuffer getData() {
		return data;
	}

	/** {@inheritDoc} */
    @Override
	public String toString() {
		return "Audio  ts: " + getTimestamp();
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
		if (data != null) {
			out.writeObject(SerializeUtils.ByteBufferToByteArray(data));
		} else {
			out.writeObject(null);
		}
	}
}