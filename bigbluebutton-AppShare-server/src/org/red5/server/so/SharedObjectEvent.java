package org.red5.server.so;

import java.io.Externalizable;
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
 * {@inheritDoc}.
 */
public class SharedObjectEvent
implements ISharedObjectEvent, Externalizable {
	
	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = -4129018814289863535L;
    
    /** Event type. */
	private Type type;
    
    /** Changed pair key. */
	private String key;
    
    /** Changed pair value. */
	private Object value;

	/**
	 * Instantiates a new shared object event.
	 */
	public SharedObjectEvent() {}
    /**
     * {@inheritDoc}
     */
	public SharedObjectEvent(Type type, String key, Object value) {
		this.type = type;
		this.key = key;
		this.value = value;
	}

	/** {@inheritDoc} */
    public String getKey() {
		return key;
	}

	/** {@inheritDoc} */
    public Type getType() {
		return type;
	}

	/** {@inheritDoc} */
    public Object getValue() {
		return value;
	}

	/** {@inheritDoc} */
    @Override
	public String toString() {
		return "SOEvent(" + getType() + ", " + getKey() + ", " + getValue()
				+ ')';
	}
	
	/* (non-Javadoc)
	 * @see java.io.Externalizable#readExternal(java.io.ObjectInput)
	 */
	public void readExternal(ObjectInput in) throws IOException, ClassNotFoundException {
		type = (Type) in.readObject();
		key = (String) in.readObject();
		value = in.readObject();
	}

	/* (non-Javadoc)
	 * @see java.io.Externalizable#writeExternal(java.io.ObjectOutput)
	 */
	public void writeExternal(ObjectOutput out) throws IOException {
		out.writeObject(type);
		out.writeObject(key);
		out.writeObject(value);
	}
}
