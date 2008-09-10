package org.red5.server.service;

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

import org.red5.server.api.IScope;

// TODO: Auto-generated Javadoc
/**
 * Interface for objects that resolve service names to services.
 * 
 * This is used by the ServiceInvoker to lookup the service to invoke
 * a method on.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 * @see org.red5.server.service.ServiceInvoker#getServiceHandler(IScope, String)
 */
public interface IServiceResolver {

	/**
	 * Search for a service with the given name in the scope.
	 * 
	 * @param scope the scope to search in
	 * @param serviceName the name of the service
	 * 
	 * @return the object implemening the service or <code>null</code> if
	 * service doesn't exist
	 */
	public Object resolveService(IScope scope, String serviceName);

}
