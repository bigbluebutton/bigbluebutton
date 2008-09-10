package org.red5.server.adapter;

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

import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;

// TODO: Auto-generated Javadoc
/**
 * JMX mbean for Application.
 * 
 * @author Paul Gregoire (mondain@gmail.com)
 */
public interface ApplicationMBean {

	/**
	 * App start.
	 * 
	 * @param app the app
	 * 
	 * @return true, if successful
	 */
	public boolean appStart(IScope app);

	/**
	 * App connect.
	 * 
	 * @param conn the conn
	 * @param params the params
	 * 
	 * @return true, if successful
	 */
	public boolean appConnect(IConnection conn, Object[] params);

	/**
	 * App join.
	 * 
	 * @param client the client
	 * @param app the app
	 * 
	 * @return true, if successful
	 */
	public boolean appJoin(IClient client, IScope app);

	/**
	 * App disconnect.
	 * 
	 * @param conn the conn
	 */
	public void appDisconnect(IConnection conn);

	/**
	 * App leave.
	 * 
	 * @param client the client
	 * @param app the app
	 */
	public void appLeave(IClient client, IScope app);

	/**
	 * App stop.
	 * 
	 * @param app the app
	 */
	public void appStop(IScope app);

	/**
	 * Room start.
	 * 
	 * @param room the room
	 * 
	 * @return true, if successful
	 */
	public boolean roomStart(IScope room);

	/**
	 * Room connect.
	 * 
	 * @param conn the conn
	 * @param params the params
	 * 
	 * @return true, if successful
	 */
	public boolean roomConnect(IConnection conn, Object[] params);

	/**
	 * Room join.
	 * 
	 * @param client the client
	 * @param room the room
	 * 
	 * @return true, if successful
	 */
	public boolean roomJoin(IClient client, IScope room);

	/**
	 * Room disconnect.
	 * 
	 * @param conn the conn
	 */
	public void roomDisconnect(IConnection conn);

	/**
	 * Room leave.
	 * 
	 * @param client the client
	 * @param room the room
	 */
	public void roomLeave(IClient client, IScope room);

	/**
	 * Room stop.
	 * 
	 * @param room the room
	 */
	public void roomStop(IScope room);

}
