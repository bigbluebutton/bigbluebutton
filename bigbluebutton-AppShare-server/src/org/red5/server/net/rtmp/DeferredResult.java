package org.red5.server.net.rtmp;

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

import java.lang.ref.WeakReference;

import org.red5.server.api.service.IPendingServiceCall;
import org.red5.server.net.rtmp.event.Invoke;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Can be returned to delay returning the result of invoked methods.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public class DeferredResult {
    
    /** Logger. */
	protected static Logger log = LoggerFactory.getLogger(DeferredResult.class);
    
    /** Weak reference to used channel. */
	private WeakReference<Channel> channel;
    
    /** Pending call object. */
    private IPendingServiceCall call;
    
    /** Invocation id. */
    private int invokeId;
    
    /** Results sent flag. */
    private boolean resultSent = false;
	
	/**
	 * Set the result of a method call and send to the caller.
	 * 
	 * @param result deferred result of the method call
	 */
	public void setResult(Object result) {
		if (this.resultSent)
			throw new RuntimeException("You can only set the result once.");

		this.resultSent = true;
		Channel channel = this.channel.get();
		if (channel == null) {
			log.warn("The client is no longer connected.");
			return;
		}
		
		Invoke reply = new Invoke();
		call.setResult(result);
		reply.setCall(call);
		reply.setInvokeId(invokeId);
		channel.write(reply);
		channel.getConnection().unregisterDeferredResult(this);
	}

	/**
	 * Check if the result has been sent to the client.
	 * 
	 * @return <code>true</code> if the result has been sent, otherwise <code>false</code>
	 */
	public boolean wasSent() {
		return resultSent;
	}
	
	/**
	 * Setter for invoke Id.
	 * 
	 * @param id  Invocation object identifier
	 */
    protected void setInvokeId(int id) {
		this.invokeId = id;
	}
	
	/**
	 * Setter for service call.
	 * 
	 * @param call  Service call
	 */
    protected void setServiceCall(IPendingServiceCall call) {
		this.call = call;
	}
	
	/**
	 * Setter for channel.
	 * 
	 * @param channel  Channel
	 */
    protected void setChannel(Channel channel) {
		this.channel = new WeakReference<Channel>(channel);
	}
}
