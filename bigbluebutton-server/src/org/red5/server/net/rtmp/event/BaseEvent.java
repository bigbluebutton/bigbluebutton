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

import java.io.Externalizable;
import java.io.IOException;
import java.io.ObjectInput;
import java.io.ObjectOutput;
import org.red5.server.api.event.IEventListener;
import org.red5.server.net.rtmp.message.Constants;
import org.red5.server.net.rtmp.message.Header;

// TODO: Auto-generated Javadoc
/**
 * Base abstract class for all RTMP events.
 */
public abstract class BaseEvent
implements Constants, IRTMPEvent, Externalizable {
	// XXX we need a better way to inject allocation debugging
	// (1) make it configurable in xml
	// (2) make it aspect oriented
	/** The Constant allocationDebugging. */
	private static final boolean allocationDebugging = false;
    
    /** Event type. */
	private Type type;
    
    /** Event target object. */
	protected Object object;
    
    /** Event listener. */
	protected IEventListener source;
    
    /** Event listener. */
	protected int timestamp;
    
    /** Event RTMP packet header. */
	protected Header header = null;
    
    /** Event references count. */
	protected int refcount = 1;
	
	/**
	 * Instantiates a new base event.
	 */
	public BaseEvent() {
		// set a default type
		this(Type.SERVER, null);
	}

    /**
     * Create new event of given type.
     * 
     * @param type             Event type
     */
    public BaseEvent(Type type) {
		this(type, null);
	}
    
    /**
     * Create new event of given type.
     * 
     * @param type             Event type
     * @param source           Event source
     */
	public BaseEvent(Type type, IEventListener source) {
		this.type = type;
		this.source = source;
		if (allocationDebugging) {
			AllocationDebugger.getInstance().create(this);
		}
	}

	/** {@inheritDoc} */
    public Type getType() {
		return type;
	}

	/** {@inheritDoc} */
    public Object getObject() {
		return object;
	}

	/** {@inheritDoc} */
    public Header getHeader() {
		return header;
	}

	/** {@inheritDoc} */
    public void setHeader(Header header) {
		this.header = header;
	}

	/** {@inheritDoc} */
    public boolean hasSource() {
		return source != null;
	}

	/** {@inheritDoc} */
    public IEventListener getSource() {
		return source;
	}

	/** {@inheritDoc} */
    public void setSource(IEventListener source) {
		this.source = source;
	}

	/** {@inheritDoc} */
    public abstract byte getDataType();

	/** {@inheritDoc} */
    public int getTimestamp() {
		return timestamp;
	}

	/** {@inheritDoc} */
    public void setTimestamp(int timestamp) {
		this.timestamp = timestamp;
	}

	/** {@inheritDoc} */
    public synchronized void retain() {
		if (allocationDebugging) {
			AllocationDebugger.getInstance().retain(this);
		}
		if (refcount > 0) {
			refcount++;
		}
	}

	/** {@inheritDoc} */
    public synchronized void release() {
		if (allocationDebugging) {
			AllocationDebugger.getInstance().release(this);
		}
		if (refcount > 0) {
			refcount--;
			if (refcount == 0) {
				releaseInternal();
			}
		}
	}

    /**
     * Rekease event.
     */
    protected abstract void releaseInternal();

	/* (non-Javadoc)
	 * @see java.io.Externalizable#readExternal(java.io.ObjectInput)
	 */
	public void readExternal(ObjectInput in) throws IOException, ClassNotFoundException {
		type = (Type) in.readObject();
		timestamp = in.readInt();
	}

	/* (non-Javadoc)
	 * @see java.io.Externalizable#writeExternal(java.io.ObjectOutput)
	 */
	public void writeExternal(ObjectOutput out) throws IOException {
		out.writeObject(type);
		out.writeInt(timestamp);
	}
}
