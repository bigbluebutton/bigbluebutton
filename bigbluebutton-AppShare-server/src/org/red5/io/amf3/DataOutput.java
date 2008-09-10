package org.red5.io.amf3;

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

import java.nio.ByteOrder;
import java.nio.charset.Charset;

import org.apache.mina.common.ByteBuffer;
import org.red5.io.object.Serializer;

// TODO: Auto-generated Javadoc
/**
 * Implementation of the IDataOutput interface. Can be used to store an
 * IExternalizable object.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public class DataOutput implements IDataOutput {

	/** The output stream. */
	private Output output;
	
	/** The serializer to use. */
	private Serializer serializer;
	
	/** Raw data of output destination. */
	private ByteBuffer buffer;
	
	/**
	 * Create a new DataOutput.
	 * 
	 * @param output 	destination to write to
	 * @param serializer the serializer to use
	 */
	protected DataOutput(Output output, Serializer serializer) {
		this.output = output;
		this.serializer = serializer;
		buffer = output.getBuffer();
	}
	
	/** {@inheritDoc} */
	public ByteOrder getEndian() {
		return buffer.order();
	}

	/** {@inheritDoc} */
	public void setEndian(ByteOrder endian) {
		buffer.order(endian);
	}
	
    /** {@inheritDoc} */
	public void writeBoolean(boolean value) {
		buffer.put((byte) (value ? 1 : 0));
	}

    /** {@inheritDoc} */
	public void writeByte(byte value) {
		buffer.put(value);
	}

    /** {@inheritDoc} */
	public void writeBytes(byte[] bytes) {
		buffer.put(bytes);
	}

    /** {@inheritDoc} */
	public void writeBytes(byte[] bytes, int offset) {
		buffer.put(bytes, offset, bytes.length - offset);
	}

    /** {@inheritDoc} */
	public void writeBytes(byte[] bytes, int offset, int length) {
		buffer.put(bytes, offset, length);
	}

    /** {@inheritDoc} */
	public void writeDouble(double value) {
		buffer.putDouble(value);
	}

    /** {@inheritDoc} */
	public void writeFloat(float value) {
		buffer.putFloat(value);
	}

    /** {@inheritDoc} */
	public void writeInt(int value) {
		buffer.putInt(value);
	}

    /** {@inheritDoc} */
	public void writeMultiByte(String value, String encoding) {
		final Charset cs = Charset.forName(encoding);
		final java.nio.ByteBuffer strBuf = cs.encode(value);
		buffer.put(strBuf);
	}

    /** {@inheritDoc} */
	public void writeObject(Object value) {
		serializer.serialize(output, value);
	}

    /** {@inheritDoc} */
	public void writeShort(short value) {
		buffer.putShort(value);
	}

    /** {@inheritDoc} */
	public void writeUnsignedInt(long value) {
		buffer.putInt((int) value);
	}

    /** {@inheritDoc} */
	public void writeUTF(String value) {
		buffer.putShort((short) value.length());
		final java.nio.ByteBuffer strBuf = AMF3.CHARSET.encode(value);
		buffer.put(strBuf);
	}

    /** {@inheritDoc} */
	public void writeUTFBytes(String value) {
		final java.nio.ByteBuffer strBuf = AMF3.CHARSET.encode(value);
		buffer.put(strBuf);
	}

}
