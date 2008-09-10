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

import org.red5.server.api.IBasicScope;
import org.red5.server.api.statistics.ISharedObjectStatistics;

// TODO: Auto-generated Javadoc
/**
 * Serverside access to shared objects.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */

public interface ISharedObject extends IBasicScope,
		ISharedObjectBase, ISharedObjectSecurityService {

	/** The Constant TYPE. */
	public static final String TYPE = "SharedObject";

	/**
	 * Prevent shared object from being released. Each call to <code>acquire</code>
	 * must be paired with a call to <code>release</code> so the SO isn't held
	 * forever.
	 * 
	 * This method basically is a noop for persistent SOs as their data is stored
	 * and they can be released without losing their contents.
	 */
	public void acquire();
	
	/**
	 * Check if shared object currently is acquired.
	 * 
	 * @return <code>true</code> if the SO is acquired, otherwise <code>false</code>
	 */
	public boolean isAcquired();
	
	/**
	 * Release previously acquired shared object. If the SO is non-persistent,
	 * no more clients are connected the SO isn't acquired any more, the data
	 * is released.
	 */
	public void release();
	
	/**
	 * Return statistics about the shared object.
	 * 
	 * @return statistics
	 */
	public ISharedObjectStatistics getStatistics();
	
}