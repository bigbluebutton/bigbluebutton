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

// TODO: Auto-generated Javadoc
/**
 * Interface implemented by classes that provide a way to store custom objects.
 * 
 * @see IExternalizable#writeExternal(IDataOutput)
 * @see <a href="http://livedocs.adobe.com/flex/2/langref/flash/utils/IDataOutput.html">Adobe Livedocs (external)</a>
 */
public interface IDataOutput {

	/**
	 * Return the byteorder used when storing values.
	 * 
	 * @return the byteorder
	 */
	public ByteOrder getEndian();
	
	/**
	 * Set the byteorder to use when storing values.
	 * 
	 * @param endian the byteorder to use
	 */
	public void setEndian(ByteOrder endian);
	
	/**
	 * Write boolean value.
	 * 
	 * @param value the value
	 */
	public void writeBoolean(boolean value);
	
	/**
	 * Write signed byte value.
	 * 
	 * @param value the value
	 */
	public void writeByte(byte value);
	
	/**
	 * Write multiple bytes.
	 * 
	 * @param bytes the bytes
	 */
	public void writeBytes(byte[] bytes);
	
	/**
	 * Write multiple bytes from given offset.
	 * 
	 * @param bytes the bytes
	 * @param offset offset in bytes to start writing from
	 */
	public void writeBytes(byte[] bytes, int offset);
	
	/**
	 * Write given number of bytes from given offset.
	 * 
	 * @param bytes the bytes
	 * @param offset offset in bytes to start writing from
	 * @param length number of bytes to write
	 */
	public void writeBytes(byte[] bytes, int offset, int length);
	
	/**
	 * Write double-precision floating point value.
	 * 
	 * @param value the value
	 */
	public void writeDouble(double value);
	
	/**
	 * Write single-precision floating point value.
	 * 
	 * @param value the value
	 */
	public void writeFloat(float value);
	
	/**
	 * Write signed integer value.
	 * 
	 * @param value the value
	 */
	public void writeInt(int value);
	
	/**
	 * Write string in given character set.
	 * 
	 * @param value the string
	 * @param encoding the character set
	 */
	public void writeMultiByte(String value, String encoding);
	
	/**
	 * Write arbitrary object.
	 * 
	 * @param value the object
	 */
	public void writeObject(Object value);
	
	/**
	 * Write signed short value.
	 * 
	 * @param value the value
	 */
	public void writeShort(short value);
	
	/**
	 * Write unsigned integer value.
	 * 
	 * @param value the value
	 */
	public void writeUnsignedInt(long value);
	
	/**
	 * Write UTF-8 encoded string.
	 * 
	 * @param value the string
	 */
	public void writeUTF(String value);
	
	/**
	 * Write UTF-8 encoded string as byte array. This string is stored without informations
	 * about its length, so {@link IDataInput#readUTFBytes(int)} must be used to load it.
	 * 
	 * @param value the string
	 */
	public void writeUTFBytes(String value);

}
