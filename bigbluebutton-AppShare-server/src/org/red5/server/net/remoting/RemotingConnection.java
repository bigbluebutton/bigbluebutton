package org.red5.server.net.remoting;

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
import java.util.Collection;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.red5.server.Client;
import org.red5.server.api.IAttributeStore;
import org.red5.server.api.IBasicScope;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.red5.server.api.event.IEvent;
import org.red5.server.api.remoting.IRemotingConnection;
import org.red5.server.api.remoting.IRemotingHeader;
import org.red5.server.net.remoting.message.RemotingPacket;
import org.red5.server.net.servlet.ServletUtils;

// TODO: Auto-generated Javadoc
/**
 * Connection class so the Red5 object works in methods invoked through
 * remoting. Attributes are stored in the session of the implementing
 * servlet container.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public class RemotingConnection implements IRemotingConnection {

	/** Session attribute holding an IClient object for this connection. */
	private final static String CLIENT = "red5.client";
	
	/** Scope. */
	protected IScope scope;
    
    /** Servlet request. */
	protected HttpServletRequest request;

	/** Remoting packet that triggered the connection. */
	protected RemotingPacket packet;
	
	/** Session used to store properties. */
	protected HttpSession session;
	
	/** Headers to be returned to the client. */
	protected List<IRemotingHeader> headers = new ArrayList<IRemotingHeader>();
	
    /**
     * Create servlet connection from request and scope.
     * 
     * @param request           Servlet request
     * @param scope             Scope
     * @param packet the packet
     */
    public RemotingConnection(HttpServletRequest request, IScope scope, RemotingPacket packet) {
		this.request = request;
		this.scope = scope;
		this.packet = packet;
		this.session = request.getSession();
		RemotingClient client = (RemotingClient) session.getAttribute(CLIENT);
		if (client == null) {
			client = new RemotingClient(session.getId());
			session.setAttribute(CLIENT, client);
		}
		client.register(this);
	}

    /**
     * Return string representation of the connection.
     * 
     * @return the string
     */
    public String toString() {
		return getClass().getSimpleName() + " from " + getRemoteAddress() + ':'
			+ getRemotePort() + " to " + getHost() + " (session: "
			+ session.getId() + ')';
    }
    
    /**
     * Update the current packet.
     * 
     * @param packet the packet
     */
    protected void setPacket(RemotingPacket packet) {
    	this.packet = packet;
    }
    
    /**
     * Throws Not supported runtime exception.
     */
    private void notSupported() {
		throw new RuntimeException("not supported for this type of connection");
	}

    /**
     * Return encoding (AMF0 or AMF3).
     * 
     * @return        Encoding, currently AMF0
     */
    public Encoding getEncoding() {
		return packet.getEncoding();
	}

    /** {@inheritDoc} */
    public String getType() {
		return IConnection.TRANSIENT;
	}

	/** {@inheritDoc} */
    public void initialize(IClient client) {
		notSupported();
	}

	/** {@inheritDoc} */
    public boolean connect(IScope scope) {
		notSupported();
		return false;
	}

	/** {@inheritDoc} */
    public boolean connect(IScope scope, Object[] params) {
		notSupported();
		return false;
	}

	/** {@inheritDoc} */
    public boolean isConnected() {
		return false;
	}

	/** {@inheritDoc} */
    public void close() {
		session.invalidate();
	}

	/** {@inheritDoc} */
	public Map<String, Object> getConnectParams() {
		return packet.getHeaders();
	}

	/** {@inheritDoc} */
    public IClient getClient() {
		return (IClient) session.getAttribute(CLIENT);
	}

	/** {@inheritDoc} */
    public String getHost() {
		return request.getLocalName();
	}

	/** {@inheritDoc} */
    public String getRemoteAddress() {
		return request.getRemoteAddr();
	}

	/** {@inheritDoc} */
    public List<String> getRemoteAddresses() {
		return ServletUtils.getRemoteAddresses(request);
	}

	/** {@inheritDoc} */
    public int getRemotePort() {
		return request.getRemotePort();
	}

	/** {@inheritDoc} */
    public String getPath() {
		String path = request.getContextPath();
		if (request.getPathInfo() != null) {
			path += request.getPathInfo();
		}
		if (path.charAt(0) == '/') {
			path = path.substring(1);
		}
		return path;
	}

	/** {@inheritDoc} */
    public String getSessionId() {
		return null;
	}

	/** {@inheritDoc} */
    public long getReadBytes() {
		return request.getContentLength();
	}

	/** {@inheritDoc} */
    public long getWrittenBytes() {
		return 0;
	}

	/** {@inheritDoc} */
    public long getPendingMessages() {
		return 0;
	}

	/**
	 * Return pending video messages number.
	 * 
	 * @return  Pending video messages number
	 */
    public long getPendingVideoMessages() {
		return 0;
	}

	/** {@inheritDoc} */
    public long getReadMessages() {
		return 1;
	}

	/** {@inheritDoc} */
    public long getWrittenMessages() {
		return 0;
	}

	/** {@inheritDoc} */
    public long getDroppedMessages() {
		return 0;
	}

	/** {@inheritDoc} */
    public void ping() {
		notSupported();
	}

	/** {@inheritDoc} */
    public int getLastPingTime() {
		return -1;
	}

	/** {@inheritDoc} */
    public IScope getScope() {
		return scope;
	}

	/** {@inheritDoc} */
    public Iterator<IBasicScope> getBasicScopes() {
		notSupported();
		return null;
	}

	/**
	 * Dispatch event.
	 * 
	 * @param event the event
	 */
	public void dispatchEvent(Object event) {
		notSupported();
	}

	/** {@inheritDoc} */
    public void dispatchEvent(IEvent event) {
		notSupported();
	}

	/** {@inheritDoc} */
    public boolean handleEvent(IEvent event) {
		notSupported();
		return false;
	}

	/** {@inheritDoc} */
    public void notifyEvent(IEvent event) {
		notSupported();
	}

	/** {@inheritDoc} */
	public Boolean getBoolAttribute(String name) {
		return (Boolean) getAttribute(name);
	}

	/** {@inheritDoc} */
	public Byte getByteAttribute(String name) {
		return (Byte) getAttribute(name);
	}

	/** {@inheritDoc} */
	public Double getDoubleAttribute(String name) {
		return (Double) getAttribute(name);
	}

	/** {@inheritDoc} */
	public Integer getIntAttribute(String name) {
		return (Integer) getAttribute(name);
	}

	/** {@inheritDoc} */
	public List getListAttribute(String name) {
		return (List) getAttribute(name);
	}

	/** {@inheritDoc} */
	public Long getLongAttribute(String name) {
		return (Long) getAttribute(name);
	}

	/** {@inheritDoc} */
	public Map getMapAttribute(String name) {
		return (Map) getAttribute(name);
	}

	/** {@inheritDoc} */
	public Set getSetAttribute(String name) {
		return (Set) getAttribute(name);
	}

	/** {@inheritDoc} */
	public Short getShortAttribute(String name) {
		return (Short) getAttribute(name);
	}

	/** {@inheritDoc} */
	public String getStringAttribute(String name) {
		return (String) getAttribute(name);
	}

	/** {@inheritDoc} */
	public Object getAttribute(String name) {
		if (name == null) {
			return null;
		}
		
		return session.getAttribute(name);
	}

	/** {@inheritDoc} */
	public Object getAttribute(String name, Object defaultValue) {
		if (name == null) {
			return null;
		}
		
		// Synchronize so default value doesn't override other default value 
		synchronized (session) {
			Object result = session.getAttribute(name);
			if (result == null && defaultValue != null) {
				session.setAttribute(name, defaultValue);
				result = defaultValue;
			}
			return result;
		}
	}

	/** {@inheritDoc} */
	@SuppressWarnings("unchecked")
	public Set<String> getAttributeNames() {
		final Set<String> result = new HashSet<String>();
		// Synchronize to prevent parallel modifications
		synchronized (session) {
			final Enumeration<String> names = session.getAttributeNames();
			while (names.hasMoreElements()) {
				result.add(names.nextElement());
			}
		}
		return Collections.unmodifiableSet(result);
	}

	/** {@inheritDoc} */
	@SuppressWarnings("unchecked")
	public Map<String, Object> getAttributes() {
		final Map<String, Object> result = new HashMap<String, Object>();
		// Synchronize to prevent parallel modifications
		synchronized (session) {
			final Enumeration<String> names = session.getAttributeNames();
			while (names.hasMoreElements()) {
				final String name = names.nextElement();
				result.put(name, session.getAttribute(name));
			}
		}
		return Collections.unmodifiableMap(result);
	}

	/** {@inheritDoc} */
	public boolean hasAttribute(String name) {
		if (name == null) {
			return false;
		}
		
		return (getAttribute(name) != null);
	}

	/** {@inheritDoc} */
	public boolean removeAttribute(String name) {
		if (name == null) {
			return false;
		}
		
		// Synchronize to prevent parallel modifications
		synchronized (session) {
			if (!hasAttribute(name)) {
				return false;
			}
			session.removeAttribute(name);
		}
		return true;
	}

	/** {@inheritDoc} */
	@SuppressWarnings("unchecked")
	public void removeAttributes() {
		// Synchronize to prevent parallel modifications
		synchronized (session) {
			final Enumeration<String> names = session.getAttributeNames();
			while (names.hasMoreElements()) {
				session.removeAttribute(names.nextElement());
			}
		}
	}

	/** {@inheritDoc} */
	public boolean setAttribute(String name, Object value) {
		if (name == null) {
			return false;
		}
		
		if (value == null) {
			session.removeAttribute(name);
		} else {
			session.setAttribute(name, value);
		}
		return true;
	}

	/** {@inheritDoc} */
	public void setAttributes(Map<String, Object> values) {
		for (Map.Entry<String, Object> entry: values.entrySet()) {
			final String name = entry.getKey();
			final Object value = entry.getValue();
			if (name != null && value != null) {
				session.setAttribute(name, value);
			}
		}
	}

	/** {@inheritDoc} */
	public void setAttributes(IAttributeStore values) {
		setAttributes(values.getAttributes());
	}

	/** {@inheritDoc} */
	public void addHeader(String name, Object value) {
		addHeader(name, value, false);
	}

	/** {@inheritDoc} */
	public void addHeader(String name, Object value, boolean mustUnderstand) {
		synchronized (headers) {
			headers.add(new RemotingHeader(name, mustUnderstand, value));
		}
	}

	/** {@inheritDoc} */
	public void removeHeader(String name) {
		addHeader(name, null, false);
	}

	/** {@inheritDoc} */
	public Collection<IRemotingHeader> getHeaders() {
		return headers;
	}
	
	/**
	 * Internal class for clients connected through Remoting.
	 */
	private class RemotingClient extends Client {
		
		/**
		 * Instantiates a new remoting client.
		 * 
		 * @param id the id
		 */
		private RemotingClient(String id) {
			super(id, null);
		}

		/** {@inheritDoc} */
		@Override
		protected void register(IConnection conn) {
			// We only have one connection per client
			for (IConnection c: getConnections()) {
				unregister(c);
			}
			super.register(conn);
		}

	}

	/** {@inheritDoc} */
	public long getClientBytesRead() {
		// This is not supported for Remoting connections
		return 0;
	}
	
}
