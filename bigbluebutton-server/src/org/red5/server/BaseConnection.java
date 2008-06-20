package org.red5.server;

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

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

import org.red5.server.api.IBasicScope;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.red5.server.api.event.IEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Base abstract class for connections. Adds connection specific functionality like work with clients
 * to AttributeStore.
 */
public abstract class BaseConnection extends AttributeStore implements
		IConnection {
	
	/** Logger. */
	protected static Logger log = LoggerFactory.getLogger(BaseConnection.class);

	/** Connection type. */
	protected String type;

	/** Connection host. */
	protected String host;

	/** Connection remote address. */
	protected String remoteAddress;

	/** Connection remote addresses. */
	protected List<String> remoteAddresses;

	/** Remote port. */
	protected int remotePort;

	/** Path of scope client connected to. */
	protected String path;

	/** Connection session identifier. */
	protected String sessionId;

	/** Number of read messages. */
	protected long readMessages;

	/** Number of written messages. */
	protected long writtenMessages;

	/** Number of dropped messages. */
	protected long droppedMessages;

	/** Connection params passed from client with NetConnection.connect call */
	@SuppressWarnings("all")
	protected Map<String, Object> params = null;

	/** Client bound to connection. */
	protected IClient client;

	/** Scope that connection belongs to. */
	protected Scope scope;

	/** Set of basic scopes. */
	protected Set<IBasicScope> basicScopes = new CopyOnWriteArraySet<IBasicScope>();

	/** Is the connection closed?. */
	protected boolean closed;
	
	/**
	 * The Constructor.
	 * 
	 * @param type                Connection type
	 * @param host                Host
	 * @param remoteAddress       Remote address
	 * @param remotePort          Remote port
	 * @param path                Scope path on server
	 * @param sessionId           Session id
	 * @param params              Params passed from client
	 */
	public BaseConnection(String type, String host, String remoteAddress,
			int remotePort, String path, String sessionId,
			Map<String, Object> params) {
		this.type = type;
		this.host = host;
		this.remoteAddress = remoteAddress;
		this.remoteAddresses = new ArrayList<String>();
		this.remoteAddresses.add(remoteAddress);
		this.remoteAddresses = Collections
				.unmodifiableList(this.remoteAddresses);
		this.remotePort = remotePort;
		this.path = path;
		this.sessionId = sessionId;
		this.params = params;
	}

	/**
	 * Initializes client.
	 * 
	 * @param client        Client bound to connection
	 */
	public void initialize(IClient client) {
		if (this.client != null && this.client instanceof Client) {
			// Unregister old client
			((Client) this.client).unregister(this);
		}
		this.client = client;
		if (this.client instanceof Client) {
			// Register new client
			((Client) this.client).register(this);
		}
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.IConnection#getType()
	 */
	public String getType() {
		return type;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.IConnection#getHost()
	 */
	public String getHost() {
		return host;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.IConnection#getRemoteAddress()
	 */
	public String getRemoteAddress() {
		return remoteAddress;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.IConnection#getRemoteAddresses()
	 */
	public List<String> getRemoteAddresses() {
		return remoteAddresses;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.IConnection#getRemotePort()
	 */
	public int getRemotePort() {
		return remotePort;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.IConnection#getPath()
	 */
	public String getPath() {
		return path;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.IConnection#getSessionId()
	 */
	public String getSessionId() {
		return sessionId;
	}

	/**
	 * Return connection parameters.
	 * 
	 * @return the connect params
	 */
	public Map<String, Object> getConnectParams() {
		return Collections.unmodifiableMap(params);
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.IConnection#getClient()
	 */
	public IClient getClient() {
		return client;
	}

	/**
	 * Check whether connection is alive.
	 * 
	 * @return       true if connection is bound to scope, false otherwise
	 */
	public boolean isConnected() {
		return scope != null;
	}

	/**
	 * Connect to another scope on server.
	 * 
	 * @param newScope     New scope
	 * 
	 * @return             true on success, false otherwise
	 */
	public boolean connect(IScope newScope) {
		return connect(newScope, null);
	}

	/**
	 * Connect to another scope on server with given parameters.
	 * 
	 * @param newScope        New scope
	 * @param params          Parameters to connect with
	 * 
	 * @return                true on success, false otherwise
	 */
	public boolean connect(IScope newScope, Object[] params) {
		final Scope oldScope = scope;
		scope = (Scope) newScope;
		if (scope.connect(this, params)) {
			if (oldScope != null) {
				oldScope.disconnect(this);
			}
			return true;
		} else {
			scope = oldScope;
			return false;
		}
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.IConnection#getScope()
	 */
	public IScope getScope() {
		return scope;
	}

	/**
	 * Closes connection.
	 */
	public void close() {
		synchronized (this) {
			if (closed || scope == null) {
				log.debug("Close, not connected nothing to do.");
				return;
			}
			
			closed = true;
		}

		log.debug("Close, disconnect from scope, and children");
		try {
			// Unregister all child scopes first
			for (IBasicScope basicScope : basicScopes) {
				unregisterBasicScope(basicScope);
			}
		} catch (Exception err) {
			log.error("Error while unregistering basic scopes.", err);
		}

		// Disconnect
		try {
			scope.disconnect(this);
		} catch (Exception err) {
			log.error("Error while disconnecting from scope " + scope, err);
		}

		// Unregister client
		if (client != null && client instanceof Client) {
			((Client) client).unregister(this);
			client = null;
		}
		scope = null;
	}

	/**
	 * Notified on event.
	 * 
	 * @param event       Event
	 */
	public void notifyEvent(IEvent event) {
		// TODO Auto-generated method stub
	}

	/**
	 * Dispatches event.
	 * 
	 * @param event       Event
	 */
	public void dispatchEvent(IEvent event) {

	}

	/**
	 * Handles event.
	 * 
	 * @param event        Event
	 * 
	 * @return             true if associated scope was able to handle event, false otherwise
	 */
	public boolean handleEvent(IEvent event) {
		return getScope().handleEvent(event);
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.IConnection#getBasicScopes()
	 */
	public Iterator<IBasicScope> getBasicScopes() {
		return basicScopes.iterator();
	}

	/**
	 * Registers basic scope.
	 * 
	 * @param basicScope      Basic scope to register
	 */
	public void registerBasicScope(IBasicScope basicScope) {
		basicScopes.add(basicScope);
		basicScope.addEventListener(this);
	}

	/**
	 * Unregister basic scope.
	 * 
	 * @param basicScope      Unregister basic scope
	 */
	public void unregisterBasicScope(IBasicScope basicScope) {
		basicScopes.remove(basicScope);
		basicScope.removeEventListener(this);
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.IConnection#getReadBytes()
	 */
	public abstract long getReadBytes();

	/* (non-Javadoc)
	 * @see org.red5.server.api.IConnection#getWrittenBytes()
	 */
	public abstract long getWrittenBytes();

	/* (non-Javadoc)
	 * @see org.red5.server.api.IConnection#getReadMessages()
	 */
	public long getReadMessages() {
		return readMessages;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.IConnection#getWrittenMessages()
	 */
	public long getWrittenMessages() {
		return writtenMessages;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.IConnection#getDroppedMessages()
	 */
	public long getDroppedMessages() {
		return droppedMessages;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.IConnection#getPendingMessages()
	 */
	public long getPendingMessages() {
		return 0;
	}

	/**
	 * Gets the pending video messages.
	 * 
	 * @param streamId the stream id
	 * 
	 * @return the pending video messages
	 */
	public long getPendingVideoMessages(int streamId) {
		return 0;
	}

	/** {@inheritDoc} */
	public long getClientBytesRead() {
		return 0;
	}
	
}
