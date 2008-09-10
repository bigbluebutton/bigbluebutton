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

import java.io.Serializable;
import java.util.Map;

// TODO: Auto-generated Javadoc
/**
 * Out-of-band control message used by inter-components communication
 * which are connected with pipes.
 * Out-of-band data is a separate data stream used for specific purposes (in TCP
 * it's referenced as "urgent data"), like lifecycle control.
 * 
 * <tt>'Target'</tt> is used to represent the receiver who may be
 * interested for receiving. It's a string of any form.
 * XXX shall we design a standard form for Target, like "class.instance"?
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Steven Gong (steven.gong@gmail.com)
 */
public class OOBControlMessage implements Serializable {
	
	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = -6037348177653934300L;
    
    /** Target. */
	private String target;
    
    /** Service name. */
	private String serviceName;
    
    /** Service params name. */
	private Map serviceParamMap;
    
    /** Result. */
	private Object result;

	/**
	 * Getter for property 'serviceName'.
	 * 
	 * @return Value for property 'serviceName'.
	 */
    public String getServiceName() {
		return serviceName;
	}

	/**
	 * Setter for property 'serviceName'.
	 * 
	 * @param serviceName Value to set for property 'serviceName'.
	 */
    public void setServiceName(String serviceName) {
		this.serviceName = serviceName;
	}

	/**
	 * Getter for property 'serviceParamMap'.
	 * 
	 * @return Value for property 'serviceParamMap'.
	 */
    public Map getServiceParamMap() {
		return serviceParamMap;
	}

	/**
	 * Setter for property 'serviceParamMap'.
	 * 
	 * @param serviceParamMap Value to set for property 'serviceParamMap'.
	 */
    public void setServiceParamMap(Map serviceParamMap) {
		this.serviceParamMap = serviceParamMap;
	}

	/**
	 * Getter for property 'target'.
	 * 
	 * @return Value for property 'target'.
	 */
    public String getTarget() {
		return target;
	}

	/**
	 * Setter for property 'target'.
	 * 
	 * @param target Value to set for property 'target'.
	 */
    public void setTarget(String target) {
		this.target = target;
	}

	/**
	 * Getter for property 'result'.
	 * 
	 * @return Value for property 'result'.
	 */
    public Object getResult() {
		return result;
	}

	/**
	 * Setter for property 'result'.
	 * 
	 * @param result Value to set for property 'result'.
	 */
    public void setResult(Object result) {
		this.result = result;
	}
}
