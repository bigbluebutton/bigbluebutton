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
 * Interface implemented by classes that provide a way to load custom objects.
 * 
 * @see IExternalizable#readExternal(IDataInput)
 * @see <a href="http://livedocs.adobe.com/flex/2/langref/flash/utils/IDataInput.html">Adobe Livedocs (external)</a>
 */
public interface IDataInput {

	/**
	 * Return the byteorder used when loading values.
	 * 
	 * @return the byteorder
	 */
	public ByteOrder getEndian();
	
	/**
	 * Set the byteorder to use when loading values.
	 * 
	 * @param endian the byteorder to use
	 */
	public void setEndian(ByteOrder endian);
	
	/**
	 * Read boolean value.
	 * 
	 * @return the value
	 */
	public boolean readBoolean();
	
	/**
	 * Read signed single byte value.
	 * 
	 * @return the value
	 */
	public byte readByte();
	
	/**
	 * Read list of bytes.
	 * 
	 * @param bytes destination for read bytes
	 */
	public void readBytes(byte[] bytes);
	
	/**
	 * Read list of bytes to given offset.
	 * 
	 * @param bytes destination for read bytes
	 * @param offset offset in destination to write to
	 */
	public void readBytes(byte[] bytes, int offset);
	
	/**
	 * Read given number of bytes to given offset.
	 * 
	 * @param bytes destination for read bytes
	 * @param offset offset in destination to write to
	 * @param length number of bytes to read
	 */
	public void readBytes(byte[] bytes, int offset, int length);

	/**
	 * Read double-precision floating point value.
	 * 
	 * @return the value
	 */
	public double readDouble();
	
	/**
	 * Read single-precision floating point value.
	 * 
	 * @return the value
	 */
	public float readFloat();
	
	/**
	 * Read signed integer value.
	 * 
	 * @return the value
	 */
	public int readInt();
	
	/**
	 * Read multibyte string.
	 * 
	 * @param length length of string to read
	 * @param charSet character set of string to read
	 * 
	 * @return the string
	 */
	public String readMultiByte(int length, String charSet);
	
	/**
	 * Read arbitrary object.
	 * 
	 * @return the object
	 */
	public Object readObject();
	
	/**
	 * Read signed short value.
	 * 
	 * @return the value
	 */
	public short readShort();

	/**
	 * Read unsigned single byte value.
	 * 
	 * @return the value
	 */
	public int readUnsignedByte();

	/**
	 * Read unsigned integer value.
	 * 
	 * @return the value
	 */
	public long readUnsignedInt();

	/**
	 * Read unsigned short value.
	 * 
	 * @return the value
	 */
	public int readUnsignedShort();

	/**
	 * Read UTF-8 encoded string.
	 * 
	 * @return the string
	 */
	public String readUTF();

	/**
	 * Read UTF-8 encoded string with given length.
	 * 
	 * @param length the length of the string
	 * 
	 * @return the string
	 */
	public String readUTFBytes(int length);

}
