package org.red5.io.flv.meta;

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
 * ICuePoint defines contract methods for use with
 * cuepoints.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Dominick Accattato (daccattato@gmail.com)
 */
public interface IMetaCue extends IMeta, Comparable {

	/**
	 * Sets the name.
	 * 
	 * @param name          Cue point name
	 */
	public void setName(String name);

	/**
	 * Gets the name.
	 * 
	 * @return name         Cue point name
	 */
	public String getName();

	/**
	 * Sets the type type can be "event" or "navigation".
	 * 
	 * @param type          Cue point type
	 */
	public void setType(String type);

	/**
	 * Gets the type.
	 * 
	 * @return type         Cue point type
	 */
	public String getType();

	/**
	 * Sets the time.
	 * 
	 * @param d              Timestamp
	 */
	public void setTime(double d);

	/**
	 * Gets the time.
	 * 
	 * @return time          Timestamp
	 */
	public double getTime();
}
