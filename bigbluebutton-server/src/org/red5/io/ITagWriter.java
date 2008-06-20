package org.red5.io;

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

import org.apache.mina.common.ByteBuffer;

// TODO: Auto-generated Javadoc
/**
 * Writes tags to FLV file.
 */
public interface ITagWriter {

	/**
	 * Return the file that is written.
	 * 
	 * @return the File to be written
	 */
	public IStreamableFile getFile();

	/**
	 * Return the offset.
	 * 
	 * @return  Offset value
	 */
	public int getOffset();

	/**
	 * Return the bytes written.
	 * 
	 * @return  Number of bytes written
	 */
	public long getBytesWritten();

	/**
	 * Writes the header bytes.
	 * 
	 * @throws IOException           I/O exception
	 */
	public void writeHeader() throws IOException;

	/**
	 * Writes a Tag object.
	 * 
	 * @param tag                    Tag to write
	 * 
	 * @return                       <code>true</code> on success, <code>false</code> otherwise
	 * 
	 * @throws IOException           I/O exception
	 */
	public boolean writeTag(ITag tag) throws IOException;

	/**
	 * Write a Tag using bytes.
	 * 
	 * @param type                   Tag type
	 * @param data                   Byte data
	 * 
	 * @return                       <code>true</code> on success, <code>false</code> otherwise
	 * 
	 * @throws IOException           I/O exception
	 */
	public boolean writeTag(byte type, ByteBuffer data) throws IOException;

	/**
	 * Write a Stream to disk using bytes.
	 * 
	 * @param b                      Array of bytes to write
	 * 
	 * @return                       <code>true</code> on success, <code>false</code> otherwise
	 * 
	 * @throws IOException           I/O exception
	 */
	public boolean writeStream(byte[] b);

	/**
	 * Closes a Writer.
	 */
	public void close();

}
