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

import org.apache.mina.common.ByteBuffer;

// TODO: Auto-generated Javadoc
/**
 * A Tag represents the contents or payload of a streamable file.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Dominick Accattato (daccattato@gmail.com)
 * @author Luke Hubbard, Codegent Ltd (luke@codegent.com)
 */
public interface ITag extends IoConstants {

	/**
	 * Return the body ByteBuffer.
	 * 
	 * @return ByteBuffer        Body as byte buffer
	 */
	public ByteBuffer getBody();

	/**
	 * Return the size of the body.
	 * 
	 * @return int               Body size
	 */
	public int getBodySize();

	/**
	 * Get the data type.
	 * 
	 * @return byte              Data type as byte
	 */
	public byte getDataType();

	/**
	 * Return the timestamp.
	 * 
	 * @return int               Timestamp
	 */
	public int getTimestamp();

	/**
	 * Returns the data as a ByteBuffer.
	 * 
	 * @return ByteBuffer        Data as byte buffer
	 */
	public ByteBuffer getData();

	/**
	 * Returns previous tag size.
	 * 
	 * @return int               Previous tag size
	 */
	public int getPreviousTagSize();

	/**
	 * Set the body ByteBuffer.
	 * 
	 * @param body               Body as ByteBuffer
	 */
	public void setBody(ByteBuffer body);

	/**
	 * Set the size of the body.
	 * 
	 * @param size               Body size
	 */
	public void setBodySize(int size);

	/**
	 * Set the data type.
	 * 
	 * @param datatype           Data type
	 */
	public void setDataType(byte datatype);

	/**
	 * Set the timestamp.
	 * 
	 * @param timestamp          Timestamp
	 */
	public void setTimestamp(int timestamp);

	/**
	 * Set the size of the previous tag.
	 * 
	 * @param size               Previous tag size
	 */
	public void setPreviousTagSize(int size);

}
