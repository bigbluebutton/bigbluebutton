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

import java.util.List;
import java.util.Map;
import java.util.Set;

// TODO: Auto-generated Javadoc
/**
 * Attribute storage with automatic object casting support.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public interface ICastingAttributeStore extends IAttributeStore {

	/**
	 * Get Boolean attribute by name.
	 * 
	 * @param name Attribute name
	 * 
	 * @return 	Attribute
	 */
	public Boolean getBoolAttribute(String name);

	/**
	 * Get Byte attribute by name.
	 * 
	 * @param name Attribute name
	 * 
	 * @return 	Attribute
	 */
	public Byte getByteAttribute(String name);

	/**
	 * Get Double attribute by name.
	 * 
	 * @param name Attribute name
	 * 
	 * @return 	Attribute
	 */
	public Double getDoubleAttribute(String name);

	/**
	 * Get Integer attribute by name.
	 * 
	 * @param name Attribute name
	 * 
	 * @return 	Attribute
	 */
	public Integer getIntAttribute(String name);

	/**
	 * Get List attribute by name.
	 * 
	 * @param name Attribute name
	 * 
	 * @return 	Attribute
	 */
	public List getListAttribute(String name);

	/**
	 * Get boolean attribute by name.
	 * 
	 * @param name Attribute name
	 * 
	 * @return 	Attribute
	 */
	public Long getLongAttribute(String name);

	/**
	 * Get Long attribute by name.
	 * 
	 * @param name Attribute name
	 * 
	 * @return 	Attribute
	 */
	public Map getMapAttribute(String name);

	/**
	 * Get Set attribute by name.
	 * 
	 * @param name Attribute name
	 * 
	 * @return 	Attribute
	 */
	public Set getSetAttribute(String name);

	/**
	 * Get Short attribute by name.
	 * 
	 * @param name Attribute name
	 * 
	 * @return 	Attribute
	 */
	public Short getShortAttribute(String name);

	/**
	 * Get String attribute by name.
	 * 
	 * @param name Attribute name
	 * 
	 * @return 	Attribute
	 */
	public String getStringAttribute(String name);

}
