package org.red5.compatibility.flex.messaging.messages;

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

import java.io.Serializable;
import java.util.Collections;
import java.util.Map;

import org.red5.io.utils.RandomGUID;

// TODO: Auto-generated Javadoc
/**
 * Base class for all Flex compatibility messages.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public class AbstractMessage implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = -2297508940724279014L;

	/** The timestamp. */
	public long timestamp;
	
	/** The headers. */
	public Map headers = Collections.EMPTY_MAP;
	
	/** The body. */
	public Object body;
	
	/** The message id. */
	public String messageId;
	
	/** The time to live. */
	public long timeToLive;
	
	/** The client id. */
	public String clientId;
	
	/** The destination. */
	public String destination;
	
	/**
	 * Initialize default message fields.
	 */
	public AbstractMessage() {
		timestamp = System.currentTimeMillis();
		messageId = new RandomGUID().toString();
	}
	
	/**
	 * Add message properties to string.
	 * 
	 * @param result <code>StringBuilder</code> to add properties to
	 */
	protected void addParameters(StringBuilder result) {
		result.append("ts="+timestamp+",");
		result.append("headers="+headers+",");
		result.append("body="+body+",");
		result.append("messageId="+messageId+",");
		result.append("timeToLive="+timeToLive+",");
		result.append("clientId="+clientId+",");
		result.append("destination="+destination);
	}
	
	/**
	 * Return string representation of the message.
	 * 
	 * @return the string
	 */
	public String toString() {
		StringBuilder result = new StringBuilder();
		result.append(getClass().getName());
		result.append("(");
		addParameters(result);
		result.append(")");
		return result.toString();
	}
	
}
