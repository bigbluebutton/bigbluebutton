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

import java.util.Iterator;
import java.util.List;
import java.util.Map;

// TODO: Auto-generated Javadoc
/**
 * The connection object.
 * 
 * Each connection has an associated client and scope. Connections may be
 * persistent, polling, or transient. The aim of this interface is to provide
 * basic connection methods shared between different types of connections
 * 
 * Future subclasses: RTMPConnection, RemotingConnection, AJAXConnection,
 * HttpConnection, etc
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Luke Hubbard (luke@codegent.com)
 */
public interface ConnectionMBean {

	/**
	 * Gets the type.
	 * 
	 * @return the type
	 */
	public String getType();

	/**
	 * Initialize.
	 * 
	 * @param client the client
	 */
	public void initialize(IClient client);

	/**
	 * Connect.
	 * 
	 * @param scope the scope
	 * 
	 * @return true, if successful
	 */
	public boolean connect(IScope scope);

	/**
	 * Connect.
	 * 
	 * @param scope the scope
	 * @param params the params
	 * 
	 * @return true, if successful
	 */
	public boolean connect(IScope scope, Object[] params);

	/**
	 * Checks if is connected.
	 * 
	 * @return true, if is connected
	 */
	public boolean isConnected();

	/**
	 * Close.
	 */
	public void close();

	/**
	 * Gets the connect params.
	 * 
	 * @return the connect params
	 */
	public Map<String, Object> getConnectParams();

	/**
	 * Gets the client.
	 * 
	 * @return the client
	 */
	public IClient getClient();

	/**
	 * Gets the host.
	 * 
	 * @return the host
	 */
	public String getHost();

	/**
	 * Gets the remote address.
	 * 
	 * @return the remote address
	 */
	public String getRemoteAddress();

	/**
	 * Gets the remote addresses.
	 * 
	 * @return the remote addresses
	 */
	public List<String> getRemoteAddresses();

	/**
	 * Gets the remote port.
	 * 
	 * @return the remote port
	 */
	public int getRemotePort();

	/**
	 * Gets the path.
	 * 
	 * @return the path
	 */
	public String getPath();

	/**
	 * Gets the session id.
	 * 
	 * @return the session id
	 */
	public String getSessionId();

	/**
	 * Gets the read bytes.
	 * 
	 * @return the read bytes
	 */
	public long getReadBytes();

	/**
	 * Gets the written bytes.
	 * 
	 * @return the written bytes
	 */
	public long getWrittenBytes();

	/**
	 * Gets the read messages.
	 * 
	 * @return the read messages
	 */
	public long getReadMessages();

	/**
	 * Gets the written messages.
	 * 
	 * @return the written messages
	 */
	public long getWrittenMessages();

	/**
	 * Gets the dropped messages.
	 * 
	 * @return the dropped messages
	 */
	public long getDroppedMessages();

	/**
	 * Gets the pending messages.
	 * 
	 * @return the pending messages
	 */
	public long getPendingMessages();

	/**
	 * Ping.
	 */
	public void ping();

	/**
	 * Gets the last ping time.
	 * 
	 * @return the last ping time
	 */
	public int getLastPingTime();

	/**
	 * Gets the scope.
	 * 
	 * @return the scope
	 */
	public IScope getScope();

	/**
	 * Gets the basic scopes.
	 * 
	 * @return the basic scopes
	 */
	public Iterator<IBasicScope> getBasicScopes();

}
