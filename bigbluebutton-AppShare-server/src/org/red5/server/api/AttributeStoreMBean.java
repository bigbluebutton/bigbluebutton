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

import java.util.Map;
import java.util.Set;

// TODO: Auto-generated Javadoc
/**
 * Base interface for all API objects with attributes.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Luke Hubbard (luke@codegent.com)
 */
public interface AttributeStoreMBean {

	/**
	 * Gets the attribute names.
	 * 
	 * @return the attribute names
	 */
	public Set<String> getAttributeNames();

	/**
	 * Gets the attributes.
	 * 
	 * @return the attributes
	 */
	public Map<String, Object> getAttributes();

	/**
	 * Sets the attribute.
	 * 
	 * @param name the name
	 * @param value the value
	 * 
	 * @return true, if successful
	 */
	public boolean setAttribute(String name, Object value);

	/**
	 * Gets the attribute.
	 * 
	 * @param name the name
	 * 
	 * @return the attribute
	 */
	public Object getAttribute(String name);

	/**
	 * Gets the attribute.
	 * 
	 * @param name the name
	 * @param defaultValue the default value
	 * 
	 * @return the attribute
	 */
	public Object getAttribute(String name, Object defaultValue);

	/**
	 * Checks for attribute.
	 * 
	 * @param name the name
	 * 
	 * @return true, if successful
	 */
	public boolean hasAttribute(String name);

	/**
	 * Removes the attribute.
	 * 
	 * @param name the name
	 * 
	 * @return true, if successful
	 */
	public boolean removeAttribute(String name);

	/**
	 * Removes the attributes.
	 */
	public void removeAttributes();

}
