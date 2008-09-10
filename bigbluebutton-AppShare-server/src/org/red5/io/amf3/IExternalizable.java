package org.red5.io.amf3;

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
 * Interface that needs to be implemented by classes that serialize / deserialize
 * themselves.
 * 
 * @see <a href="http://livedocs.adobe.com/flex/2/langref/flash/utils/IExternalizable.html">Adobe Livedocs (external)</a>
 */
public interface IExternalizable {

	/**
	 * Load custom object from stream.
	 * 
	 * @param input object to be used for data loading
	 */
	public void readExternal(IDataInput input);
	
	/**
	 * Store custom object to stream.
	 * 
	 * @param output object to be used for data storing
	 */
	public void writeExternal(IDataOutput output);
	
}
