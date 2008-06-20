package org.red5.server.api.service;

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
 * Interface for objects that execute service calls (remote calls from client).
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Luke Hubbard (luke@codegent.com)
 */
public interface IServiceInvoker {

	/**
	 * Execute the passed service call in the given scope.  This looks up the
	 * handler for the call in the scope and the context of the scope.
	 * 
	 * @param call the call to invoke
	 * @param scope the scope to search for a handler
	 * 
	 * @return <code>true</code> if the call was performed, otherwise <code>false</code>
	 */
    boolean invoke(IServiceCall call, IScope scope);

	/**
	 * Execute the passed service call in the given object.
	 * 
	 * @param call the call to invoke
	 * @param service the service to use
	 * 
	 * @return <code>true</code> if the call was performed, otherwise <code>false</code>
	 */
    boolean invoke(IServiceCall call, Object service);

}
