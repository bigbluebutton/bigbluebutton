package org.red5.server.net.remoting.message;

/*
 * RED5 Open Source Flash Server - http://www.osflash.org/red5
 * 
 * Copyright (c) 2006-2007 by respective authors. All rights reserved.
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

import org.red5.compatibility.flex.messaging.messages.ErrorMessage;
import org.red5.server.service.PendingCall;

// TODO: Auto-generated Javadoc
/**
 * Remoting method call, specific pending call.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Luke Hubbard, Codegent Ltd (luke@codegent.com)
 */
public class RemotingCall extends PendingCall {
    
    /** Handler success posfix constant. */
	public static final String HANDLER_SUCCESS = "/onResult";
    
    /** Handler error posfix constant. */
	public static final String HANDLER_ERROR = "/onStatus";
    
    /** Client callback name. */
	public String clientCallback;

	/** The is am f3. */
	public boolean isAMF3;
	
	/** The is messaging. */
	public boolean isMessaging;
	
    /**
     * Create remoting call from service name, method name, list of arguments and callback name.
     * 
     * @param serviceName                Service name
     * @param serviceMethod              Service method name
     * @param args                       Parameters passed to method
     * @param callback                   Name of client callback
     * @param isAMF3                     Does the client support AMF3?
     * @param isMessaging 			 Is this a Flex messaging request?
     */
    public RemotingCall(String serviceName, String serviceMethod, Object[] args, String callback, boolean isAMF3, boolean isMessaging) {
		super(serviceName, serviceMethod, args);
		setClientCallback(callback);
		this.isAMF3 = isAMF3;
		this.isMessaging = isMessaging;
	}

	/**
	 * Setter for client callback.
	 * 
	 * @param clientCallback  Client callback
	 */
    public void setClientCallback(String clientCallback) {
		this.clientCallback = clientCallback;
	}

	/**
	 * Getter for client response.
	 * 
	 * @return  Client response
	 */
    public String getClientResponse() {
		if (clientCallback != null) {
			return clientCallback
					+ (isSuccess() && !(getClientResult() instanceof ErrorMessage) ? HANDLER_SUCCESS : HANDLER_ERROR);
		} else {
			return null;
		}
	}

	/**
	 * Getter for client result.
	 * 
	 * @return Client result
	 */
    public Object getClientResult() {
		return isSuccess() ? getResult() : getException();
	}

}
