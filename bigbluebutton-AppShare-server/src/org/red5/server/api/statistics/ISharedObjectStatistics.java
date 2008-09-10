package org.red5.server.api.statistics;

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
 * Statistics informations about a shared object.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public interface ISharedObjectStatistics extends IStatisticsBase {

	/**
	 * Return the name of the shared object.
	 * 
	 * @return the name of the shared object
	 */
	public String getName();
	
	/**
	 * Check if the shared object is persistent.
	 * 
	 * @return <code>True</code> if the shared object is persistent, otherwise <code>False</code>
	 */
	public boolean isPersistentObject();
	
	/**
	 * Return the version number of the shared object.
	 * 
	 * @return the version
	 */
	public int getVersion();
	
	/**
	 * Return total number of subscribed listeners.
	 * 
	 * @return number of listeners
	 */
	public int getTotalListeners();
	
	/**
	 * Return maximum number of concurrent subscribed listenes.
	 * 
	 * @return number of listeners
	 */
	public int getMaxListeners();
	
	/**
	 * Return current number of subscribed listeners.
	 * 
	 * @return number of listeners
	 */
	public int getActiveListeners();
	
	/**
	 * Return number of attribute changes.
	 * 
	 * @return number of changes
	 */
	public int getTotalChanges();
	
	/**
	 * Return number of attribute deletes.
	 * 
	 * @return number of deletes
	 */
	public int getTotalDeletes();
	
	/**
	 * Return number of times a message was sent.
	 * 
	 * @return number of sends
	 */
	public int getTotalSends();
	
}
