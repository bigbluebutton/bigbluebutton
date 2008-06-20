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
public interface IAttributeStore extends AttributeStoreMBean {

	/**
	 * Get the attribute names. The resulting set will be read-only.
	 * 
	 * @return set containing all attribute names
	 */
	public Set<String> getAttributeNames();

	/**
	 * Get the attributes. The resulting map will be read-only.
	 * 
	 * @return map containing all attributes
	 */
	public Map<String, Object> getAttributes();
	
	/**
	 * Set an attribute on this object.
	 * 
	 * @param name the name of the attribute to change
	 * @param value the new value of the attribute
	 * 
	 * @return true if the attribute value changed otherwise false
	 */
	public boolean setAttribute(String name, Object value);

	/**
	 * Set multiple attributes on this object.
	 * 
	 * @param values the attributes to set
	 */
	public void setAttributes(Map<String, Object> values);

	/**
	 * Set multiple attributes on this object.
	 * 
	 * @param values the attributes to set
	 */
	public void setAttributes(IAttributeStore values);

	/**
	 * Return the value for a given attribute.
	 * 
	 * @param name the name of the attribute to get
	 * 
	 * @return the attribute value or null if the attribute doesn't exist
	 */
	public Object getAttribute(String name);

	/**
	 * Return the value for a given attribute and set it if it doesn't exist.
	 * 
	 * <p>
	 * This is a utility function that internally performs the following code:
	 * <p>
	 * <code>
	 * if (!hasAttribute(name)) setAttribute(name, defaultValue);<br>
	 * return getAttribute(name);<br>
	 * </code>
	 * </p>
	 * </p>
	 * 
	 * @param name the name of the attribute to get
	 * @param defaultValue the value of the attribute to set if the attribute doesn't
	 * exist
	 * 
	 * @return the attribute value
	 */
	public Object getAttribute(String name, Object defaultValue);

	/**
	 * Check the object has an attribute.
	 * 
	 * @param name the name of the attribute to check
	 * 
	 * @return true if the attribute exists otherwise false
	 */
	public boolean hasAttribute(String name);

	/**
	 * Remove an attribute.
	 * 
	 * @param name the name of the attribute to remove
	 * 
	 * @return true if the attribute was found and removed otherwise false
	 */
	public boolean removeAttribute(String name);

	/**
	 * Remove all attributes.
	 */
	public void removeAttributes();

}
