package org.red5.server.api;

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

import org.red5.server.api.event.IEventObservable;
import org.red5.server.api.persistence.IPersistable;

// TODO: Auto-generated Javadoc
/**
 * Base interface for all scope objects, including SharedObjects.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Luke Hubbard (luke@codegent.com)
 */
public interface IBasicScope extends ICoreObject, IEventObservable,
		Iterable<IBasicScope>, IPersistable {

	/**
	 * Does this scope have a parent? You can think of scopes as of tree items
	 * where scope may have a parent and children (child).
	 * 
	 * @return <code>true</code> if this scope has a parent, otherwise
	 * <code>false</code>
	 */
	public boolean hasParent();

	/**
	 * Get this scopes parent.
	 * 
	 * @return parent scope, or <code>null</code> if this scope doesn't have a
	 * parent
	 */
	public IScope getParent();

	/**
	 * Get the scopes depth, how far down the scope tree is it. The lowest depth
	 * is 0x00, the depth of Global scope. Application scope depth is 0x01. Room
	 * depth is 0x02, 0x03 and so forth.
	 * 
	 * @return the depth
	 */
	public int getDepth();

	/**
	 * Get the name of this scope. Eg. <code>someroom</code>.
	 * 
	 * @return the name
	 */
	public String getName();

	/**
	 * Get the full absolute path. Eg. <code>host/myapp/someroom</code>.
	 * 
	 * @return Absolute scope path
	 */
	public String getPath();

	/**
	 * Get the type of the scope.
	 * 
	 * @return Type of scope
	 */
	public String getType();

}
