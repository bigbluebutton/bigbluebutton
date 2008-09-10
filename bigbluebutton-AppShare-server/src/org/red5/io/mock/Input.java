package org.red5.io.mock;

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

import java.util.Date;
import java.util.List;
import java.util.Map;

import org.red5.io.amf3.ByteArray;
import org.red5.io.object.BaseInput;
import org.red5.io.object.Deserializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;

// TODO: Auto-generated Javadoc
/**
 * The Class Input.
 */
public class Input extends BaseInput implements org.red5.io.object.Input {

	/** The log. */
	protected static Logger log = LoggerFactory.getLogger(Input.class);

	/** The list. */
	protected List<Object> list;

	/** The idx. */
	protected int idx;

	/**
	 * Instantiates a new input.
	 * 
	 * @param list the list
	 */
	public Input(List<Object> list) {
		super();
		this.list = list;
		this.idx = 0;
	}

	/**
	 * Getter for property 'next'.
	 * 
	 * @return Value for property 'next'.
	 */
    protected Object getNext() {
		return list.get(idx++);
	}

	/** {@inheritDoc} */
    public byte readDataType() {
		Byte b = (Byte) getNext();
		return b.byteValue();
	}

	// Basic

	/** {@inheritDoc} */
    public Object readNull() {
		return null;
	}

	/** {@inheritDoc} */
    public Boolean readBoolean() {
		return (Boolean) getNext();
	}

	/** {@inheritDoc} */
    public Number readNumber() {
		return (Number) getNext();
	}
    /** {@inheritDoc} */
	public String getString() {
		return (String) getNext();
	}
    /** {@inheritDoc} */
	public String readString() {
		return (String) getNext();
	}

	/** {@inheritDoc} */
    public Date readDate() {
		return (Date) getNext();
	}

	// Array

	/** {@inheritDoc} */
    public Object readArray(Deserializer deserializer) {
    	return getNext();
    }
    
	/** {@inheritDoc} */
    public Object readMap(Deserializer deserializer) {
		return getNext();
	}
    
	/** {@inheritDoc} */
    @SuppressWarnings("unchecked")
    public Map<String, Object> readKeyValues(Deserializer deserializer) {
		return (Map<String, Object>) getNext();
	}
    
	// Object

	/** {@inheritDoc} */
    public Object readObject(Deserializer deserializer) {
		return getNext();
	}

	/** {@inheritDoc} */
	public Document readXML() {
		return (Document) getNext();
	}

	/** {@inheritDoc} */
    public Object readCustom() {
		// Not supported
		return null;
	}

	/** {@inheritDoc} */
    public ByteArray readByteArray() {
    	return (ByteArray) getNext();
    }
    
	/** {@inheritDoc} */
    public Object readReference() {
		final Short num = (Short) getNext();
		return getReference(num.shortValue());
	}

}
