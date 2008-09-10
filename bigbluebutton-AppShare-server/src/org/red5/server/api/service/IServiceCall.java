package org.red5.server.api.service;

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
 * Container for a Service Call.
 */
public interface IServiceCall {

	/**
	 * Whether call was successful or not.
	 * 
	 * @return <code>true</code> on success, <code>false</code> otherwise
	 */
	public abstract boolean isSuccess();

	/**
	 * Returns service method name.
	 * 
	 * @return Service method name as string
	 */
	public abstract String getServiceMethodName();

	/**
	 * Returns service name.
	 * 
	 * @return Service name
	 */
	public abstract String getServiceName();

	/**
	 * Returns array of service method arguments.
	 * 
	 * @return array of service method arguments
	 */
	public abstract Object[] getArguments();

	/**
	 * Get service call status.
	 * 
	 * @return service call status
	 */
	public abstract byte getStatus();

	/**
	 * Get service call exception.
	 * 
	 * @return service call exception
	 */
	public abstract Exception getException();

	/**
	 * Sets status.
	 * 
	 * @param status Status as byte
	 */
	public abstract void setStatus(byte status);

	/**
	 * Sets exception.
	 * 
	 * @param exception Call exception
	 */
	public abstract void setException(Exception exception);

}