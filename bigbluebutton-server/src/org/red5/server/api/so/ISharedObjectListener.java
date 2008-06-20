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
import java.util.Map;

import org.red5.server.api.IAttributeStore;

// TODO: Auto-generated Javadoc
/**
 * Notifications about shared object updates.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Luke Hubbard (luke@codegent.com)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public interface ISharedObjectListener {

	/**
	 * Called when a client connects to a shared object.
	 * 
	 * @param so the shared object
	 */
	void onSharedObjectConnect(ISharedObjectBase so);

	/**
	 * Called when a client disconnects from a shared object.
	 * 
	 * @param so the shared object
	 */
	void onSharedObjectDisconnect(ISharedObjectBase so);

	/**
	 * Called when a shared object attribute is updated.
	 * 
	 * @param so the shared object
	 * @param key the name of the attribute
	 * @param value the value of the attribute
	 */
	void onSharedObjectUpdate(ISharedObjectBase so, String key, Object value);

	/**
	 * Called when multiple attributes of a shared object are updated.
	 * 
	 * @param so the shared object
	 * @param values the new attributes of the shared object
	 */
	void onSharedObjectUpdate(ISharedObjectBase so, IAttributeStore values);

	/**
	 * Called when multiple attributes of a shared object are updated.
	 * 
	 * @param so the shared object
	 * @param values the new attributes of the shared object
	 */
	void onSharedObjectUpdate(ISharedObjectBase so, Map<String, Object> values);

	/**
	 * Called when an attribute is deleted from the shared object.
	 * 
	 * @param so the shared object
	 * @param key the name of the attribute to delete
	 */
	void onSharedObjectDelete(ISharedObjectBase so, String key);

	/**
	 * Called when all attributes of a shared object are removed.
	 * 
	 * @param so the shared object
	 */
	void onSharedObjectClear(ISharedObjectBase so);

	/**
	 * Called when a shared object method call is sent.
	 * 
	 * @param so the shared object
	 * @param method the method name to call
	 * @param params the arguments
	 */
	void onSharedObjectSend(ISharedObjectBase so, String method, List params);

}
