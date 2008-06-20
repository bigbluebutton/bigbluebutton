package org.red5.server.net.remoting.message;

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

import java.nio.ByteBuffer;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.red5.server.api.IConnection.Encoding;

// TODO: Auto-generated Javadoc
/**
 * Packet of remote calls. Used by RemoteProtocolDecoder.
 */
public class RemotingPacket {
    
    /** HTTP request object. */
	protected HttpServletRequest request;
    
    /** Byte buffer data. */
	protected ByteBuffer data;
	
	/** Headers sent with request. */
	protected Map<String, Object> headers;
    
    /** List of calls. */
	protected List<RemotingCall> calls;
    
    /** Scope path. */
	protected String scopePath;

    /**
     * Create remoting packet from list of pending calls.
     * 
     * @param calls              List of call objects
     * @param headers the headers
     */
    public RemotingPacket(Map<String, Object> headers, List<RemotingCall> calls) {
    	this.headers = headers;
		this.calls = calls;
	}

    /**
     * Get the headers sent with the request.
     * 
     * @return the headers
     */
    public Map<String, Object> getHeaders() {
    	return headers;
    }
    
	/**
	 * Getter for calls.
	 * 
	 * @return   List of remote calls
	 */
    public List<RemotingCall> getCalls() {
		return calls;
	}

	/**
	 * Setter for scope path.
	 * 
	 * @param path Value to set for property 'scopePath'.
	 */
    public void setScopePath(String path) {
		scopePath = path;
	}

	/**
	 * Getter for property scope path.
	 * 
	 * @return  Scope path to set
	 */
    public String getScopePath() {
		return scopePath;
	}

    /**
     * Return the encoding of the included calls.
     * 
     * @return the encoding
     */
    public Encoding getEncoding() {
    	List<RemotingCall> calls = getCalls();
    	if (calls == null || calls.isEmpty()) {
    		return Encoding.AMF0;
    	}
    	
    	RemotingCall call = calls.get(0);
    	return call.isAMF3 ? Encoding.AMF3 : Encoding.AMF0;
    }
    
}
