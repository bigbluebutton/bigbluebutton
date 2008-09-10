package org.red5.io.flv.impl;

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
import org.red5.io.ITag;

// TODO: Auto-generated Javadoc
/**
 * A Tag represents the contents or payload of a FLV file.
 * 
 * @see <a href="http://osflash.org/flv#flv_tag">OSFlash (external)</a>
 * @author The Red5 Project (red5@osflash.org)
 * @author Dominick Accattato (daccattato@gmail.com)
 * @author Luke Hubbard, Codegent Ltd (luke@codegent.com)
 */
public class Tag implements ITag {
    
    /** Tag type. */
	private byte type;
    
    /** Tag data type. */
	private byte dataType;
    
    /** Timestamp. */
	private int timestamp;
    
    /** Tag body size. */
	private int bodySize;
    
    /** Tag body as byte buffer. */
	private ByteBuffer body;
    
    /** Previous tag size. */
	private int previuosTagSize;

    /** Bit flags. */
    private byte bitflags;

	/**
	 * TagImpl Constructor.
	 * 
	 * @param dataType              Tag data type
	 * @param timestamp             Timestamp
	 * @param bodySize              Tag body size
	 * @param body                  Tag body
	 * @param previousTagSize       Previous tag size information
	 */
	public Tag(byte dataType, int timestamp, int bodySize, ByteBuffer body,
			int previousTagSize) {
		this.dataType = dataType;
		this.timestamp = timestamp;
		this.bodySize = bodySize;
		this.body = body;
		this.previuosTagSize = previousTagSize;
	}

	/**
	 * Constructs a new Tag.
	 */
    public Tag() {

	}

	/**
	 * Getter for bit flags.
	 * 
	 * @return Value for bit flags
	 */
	public byte getBitflags() {
		return bitflags;
	}

	/**
	 * Setter for bit flags.
	 * 
	 * @param bitflags  Bit flags
	 */
	public void setBitflags(byte bitflags) {
		this.bitflags = bitflags;
	}

	/**
	 * Getter for previous tag size.
	 * 
	 * @return Value for previous tag size
	 */
	public int getPreviuosTagSize() {
		return previuosTagSize;
	}

	/**
	 * Setter for previous tag size.
	 * 
	 * @param previuosTagSize Value to set for previous tag size
	 */
	public void setPreviuosTagSize(int previuosTagSize) {
		this.previuosTagSize = previuosTagSize;
	}

	/** {@inheritDoc}
	 */
	public ByteBuffer getData() {
		// TODO Auto-generated method stub
		return null;
	}

	/**
	 * Return the body ByteBuffer.
	 * 
	 * @return         Tag body
	 */
	public ByteBuffer getBody() {
		return body;
	}

	/**
	 * Return the size of the body.
	 * 
	 * @return                Tag body size
	 */
	public int getBodySize() {
		return bodySize;
	}

	/**
	 * Get the data type.
	 * 
	 * @return               Tag data type
	 */
	public byte getDataType() {
		return dataType;
	}

	/**
	 * Return the timestamp.
	 * 
	 * @return                Tag timestamp
	 */
	public int getTimestamp() {
		return timestamp;
	}

	/**
	 * Return previous tag size.
	 * 
	 * @return                Previous tag size
	 */
	public int getPreviousTagSize() {
		return previuosTagSize;
	}

	/**
	 * Prints out the contents of the tag.
	 * 
	 * @return  Tag contents
	 */
	@Override
	public String toString() {
		String ret = "Data Type\t=" + dataType + "\n";
		ret += "Prev. Tag Size\t=" + previuosTagSize + "\n";
		ret += "Body size\t=" + bodySize + "\n";
		ret += "timestamp\t=" + timestamp + "\n";
		ret += "Body Data\t=" + body + "\n";
		return ret;
	}

	/**
	 * Getter for tag type.
	 * 
	 * @return  Tag type
	 */
    public byte getType() {
		return type;
	}

	/**
	 * Setter for tag type.
	 * 
	 * @param type Tag type
	 */
    public void setType(byte type) {
		this.type = type;
	}

	/** {@inheritDoc} */
    public void setBody(ByteBuffer body) {
		this.body = body;
	}

	/** {@inheritDoc} */
    public void setBodySize(int bodySize) {
		this.bodySize = bodySize;
	}

	/** {@inheritDoc} */
    public void setDataType(byte dataType) {
		this.dataType = dataType;
	}

	/** {@inheritDoc} */
    public void setTimestamp(int timestamp) {
		this.timestamp = timestamp;
	}

    /**
     * Setter for tag data. Empty method.
     */
    public void setData() {
		// TODO Auto-generated method stub
	}

	/** {@inheritDoc} */
    public void setPreviousTagSize(int size) {
		this.previuosTagSize = size;
	}

}
