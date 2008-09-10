package org.red5.server.api.so;

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

import java.util.List;

import org.red5.server.api.IScope;

// TODO: Auto-generated Javadoc
/**
 * Interface for handlers that control access to shared objects.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public interface ISharedObjectSecurity {

	/**
	 * Check if the a shared object may be created in the given scope.
	 * 
	 * @param scope the scope
	 * @param name the name
	 * @param persistent the persistent
	 * 
	 * @return true, if checks if is creation allowed
	 */
	public boolean isCreationAllowed(IScope scope, String name, boolean persistent);
	
	/**
	 * Check if a connection to the given existing shared object is allowed.
	 * 
	 * @param so the so
	 * 
	 * @return true, if checks if is connection allowed
	 */
	public boolean isConnectionAllowed(ISharedObject so);

	/**
	 * Check if a modification is allowed on the given shared object.
	 * 
	 * @param so the so
	 * @param key the key
	 * @param value the value
	 * 
	 * @return true, if checks if is write allowed
	 */
	public boolean isWriteAllowed(ISharedObject so, String key, Object value);

	/**
	 * Check if the deletion of a property is allowed on the given shared object.
	 * 
	 * @param so the so
	 * @param key the key
	 * 
	 * @return true, if checks if is delete allowed
	 */
	public boolean isDeleteAllowed(ISharedObject so, String key);

	/**
	 * Check if sending a message to the shared object is allowed.
	 * 
	 * @param so the so
	 * @param message the message
	 * @param arguments the arguments
	 * 
	 * @return true, if checks if is send allowed
	 */
	public boolean isSendAllowed(ISharedObject so, String message, List arguments);

}
