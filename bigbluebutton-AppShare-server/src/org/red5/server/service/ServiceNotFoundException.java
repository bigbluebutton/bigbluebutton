package org.red5.server.service;

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
 * Thrown when service can't be found thus remote call throws an exception.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Luke Hubbard, Codegent Ltd (luke@codegent.com)
 */
public class ServiceNotFoundException extends RuntimeException {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 7543755414829244027L;

	/** Name of service that doesn't exist. */
	private String serviceName;
	
    /**
     * Creates new exception with service name.
     * 
     * @param serviceName       Name of service that couldn't been found
     */
    public ServiceNotFoundException(String serviceName) {
		super("Service not found: " + serviceName);
		this.serviceName = serviceName;
	}

    /**
     * Get the name of the service that doesn't exist.
     * 
     * @return name of the service
     */
    public String getServiceName() {
    	return serviceName;
    }
    
}
