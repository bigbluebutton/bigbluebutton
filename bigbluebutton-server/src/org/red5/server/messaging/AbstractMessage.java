package org.red5.server.messaging;

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

import java.util.Map;

// TODO: Auto-generated Javadoc
/**
 * Abstract base for all messages.
 * 
 * @see org.red5.server.messaging.IMessage
 */
public class AbstractMessage implements IMessage {
    
    /** {@inheritDoc}. */
    protected String messageID;
    
    /** {@inheritDoc}. */
	protected String correlationID;
    
    /** {@inheritDoc}. */
	protected String messageType;
    
    /** {@inheritDoc}. */
	protected Map extraHeaders = null;

	/** {@inheritDoc} */
    public String getMessageID() {
		return messageID;
	}

	/** {@inheritDoc} */
    public void setMessageID(String id) {
		this.messageID = id;
	}

	/** {@inheritDoc} */
    public String getCorrelationID() {
		return correlationID;
	}

	/** {@inheritDoc} */
    public void setCorrelationID(String id) {
		this.correlationID = id;
	}

	/** {@inheritDoc} */
    public String getMessageType() {
		return messageType;
	}

	/** {@inheritDoc} */
    public void setMessageType(String type) {
		this.messageType = type;
	}

	/** {@inheritDoc} */
    public boolean getBooleanProperty(String name) {
		// TODO Auto-generated method stub
		return false;
	}

	/** {@inheritDoc} */
    public void setBooleanProperty(String name, boolean value) {
		// TODO Auto-generated method stub

	}

	/** {@inheritDoc} */
    public byte getByteProperty(String name) {
		// TODO Auto-generated method stub
		return 0;
	}

	/** {@inheritDoc} */
    public void setByteProperty(String name, byte value) {
		// TODO Auto-generated method stub

	}

	/** {@inheritDoc} */
    public double getDoubleProperty(String name) {
		// TODO Auto-generated method stub
		return 0;
	}

	/** {@inheritDoc} */
    public void setDoubleProperty(String name, double value) {
		// TODO Auto-generated method stub

	}

	/** {@inheritDoc} */
    public float getFloatProperty(String name) {
		// TODO Auto-generated method stub
		return 0;
	}

	/** {@inheritDoc} */
    public void setFloatProperty(String name, float value) {
		// TODO Auto-generated method stub

	}

	/** {@inheritDoc} */
    public int getIntProperty(String name) {
		// TODO Auto-generated method stub
		return 0;
	}

	/** {@inheritDoc} */
    public void setIntProperty(String name, int value) {
		// TODO Auto-generated method stub

	}

	/** {@inheritDoc} */
    public long getLongProperty(String name) {
		// TODO Auto-generated method stub
		return 0;
	}

	/** {@inheritDoc} */
    public void setLongProperty(String name, long value) {
		// TODO Auto-generated method stub

	}

	/** {@inheritDoc} */
    public short getShortProperty(String name) {
		// TODO Auto-generated method stub
		return 0;
	}

	/** {@inheritDoc} */
    public void setShortProperty(String name, short value) {
		// TODO Auto-generated method stub

	}

	/** {@inheritDoc} */
    public String getStringProperty(String name) {
		// TODO Auto-generated method stub
		return null;
	}

	/** {@inheritDoc} */
    public void setStringProperty(String name, String value) {
		// TODO Auto-generated method stub

	}

	/** {@inheritDoc} */
    public Object getObjectProperty(String name) {
		// TODO Auto-generated method stub
		return null;
	}

	/** {@inheritDoc} */
    public void setObjectProperty(String name, Object value) {
		// TODO Auto-generated method stub

	}

}
