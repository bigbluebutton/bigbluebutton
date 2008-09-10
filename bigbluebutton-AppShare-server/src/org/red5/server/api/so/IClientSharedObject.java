package org.red5.server.api.so;

import org.red5.server.api.IConnection;

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
 * Clientside access to shared objects.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */

public interface IClientSharedObject extends ISharedObjectBase {

	/**
	 * Connect the shared object using the passed connection.
	 * 
	 * @param conn the conn
	 */
	public void connect(IConnection conn);
	
	/**
	 * Check if the shared object is connected to the server.
	 * 
	 * @return true, if checks if is connected
	 */
	public boolean isConnected();
	
	/**
	 * Disconnect the shared object.
	 */
	public void disconnect();
	
}
