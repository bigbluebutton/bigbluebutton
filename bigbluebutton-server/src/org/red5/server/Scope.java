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

import java.io.IOException;
import java.util.Collections;
import java.util.Iterator;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;

import org.red5.server.api.IBasicScope;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.IContext;
import org.red5.server.api.IGlobalScope;
import org.red5.server.api.IScope;
import org.red5.server.api.IScopeAware;
import org.red5.server.api.IScopeHandler;
import org.red5.server.api.IServer;
import org.red5.server.api.event.IEvent;
import org.red5.server.api.persistence.PersistenceUtils;
import org.red5.server.api.statistics.IScopeStatistics;
import org.red5.server.api.statistics.support.StatisticsCounter;
import org.red5.server.jmx.JMXAgent;
import org.red5.server.jmx.JMXFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.style.ToStringCreator;

// TODO: Auto-generated Javadoc
/**
 * The scope object.
 * 
 * A statefull object shared between a group of clients connected to the same
 * context path. Scopes are arranged in a hierarchical way, so its possible for
 * a scope to have a parent. If a client is connect to a scope then they are
 * also connected to its parent scope. The scope object is used to access
 * resources, shared object, streams, etc.
 * 
 * The following are all names for scopes: application, room, place, lobby.
 * 
 * @author The Red5 Project (red5@osflash.org)
 */
public class Scope extends BasicScope implements IScope, IScopeStatistics,
		ScopeMBean {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(Scope.class);

	/**
	 * Iterates through connections.
	 */
	class ConnectionIterator implements Iterator<IConnection> {
		
		/** Connections iterator. */
		private Iterator<IConnection> connIterator;

		/** Current connection. */
		private IConnection current;

		/** Set iterator. */
		private final Iterator<Set<IConnection>> setIterator;

		/**
		 * Creates connection iterator.
		 */
		public ConnectionIterator() {
			setIterator = clients.values().iterator();
		}

		/**
		 * {@inheritDoc}
		 */
		public boolean hasNext() {
			if (connIterator != null && connIterator.hasNext()) {
				// More connections for this client
				return true;
			}

			if (!setIterator.hasNext()) {
				// No more clients
				return false;
			}

			connIterator = setIterator.next().iterator();
			while (connIterator != null) {
				if (connIterator.hasNext()) {
					// Found client with connections
					return true;
				}

				if (!setIterator.hasNext()) {
					// No more clients
					return false;
				}

				// Advance to next client
				connIterator = setIterator.next().iterator();
			}
			return false;
		}

		/**
		 * {@inheritDoc}
		 */
		public IConnection next() {
			if (connIterator == null || !connIterator.hasNext()) {
				if (!setIterator.hasNext()) {
					// No more clients
					throw new NoSuchElementException();
				}

				connIterator = setIterator.next().iterator();
				while (!connIterator.hasNext()) {
					// Client has no connections, search next one
					if (!setIterator.hasNext()) {
						// No more clients
						throw new NoSuchElementException();
					}

					connIterator = setIterator.next().iterator();
				}
			}
			// Always of type IConnection, no need to cast
			current = connIterator.next();
			return current;
		}

		/**
		 * {@inheritDoc}
		 */
		public void remove() {
			if (current != null) {
				disconnect(current);
			}
		}

	}

	/**
	 * Iterator that filters strings by given prefix.
	 */
	class PrefixFilteringStringIterator implements Iterator<String> {
		
		/** Iterator. */
		private final Iterator<String> iterator;

		/** Next object. */
		private String next;

		/** Prefix. */
		private final String prefix;

		/**
		 * Creates prefix filtering string iterator from iterator and prefix.
		 * 
		 * @param iterator Iterator
		 * @param prefix Prefix
		 */
		public PrefixFilteringStringIterator(Iterator<String> iterator,
				String prefix) {
			this.iterator = iterator;
			this.prefix = prefix;
		}

		/** {@inheritDoc} */
		public boolean hasNext() {
			if (next != null) {
				return true;
			}
			do {
				next = (iterator.hasNext()) ? iterator.next() : null;
			} while (next != null && !next.startsWith(prefix));
			return next != null;
		}

		/** {@inheritDoc} */
		public String next() {
			if (next != null) {
				final String result = next;
				next = null;
				return result.substring(prefix.length());
			}
			if (hasNext()) {
				return next();
			} else {
				return null;
			}
		}

		/** {@inheritDoc} */
		public void remove() {
			throw new UnsupportedOperationException();
		}

	}

	/** Logger. */
	protected static Logger log = LoggerFactory.getLogger(Scope.class);

	/** Scope type constant. */
	private static final String TYPE = "scope";

	/** Unset flag constant. */
	private static final int UNSET = -1;

	/** Autostart flag. */
	private boolean autoStart = true;

	/** Child scopes map (child scopes are named). */
	private final ConcurrentMap<String, IBasicScope> children = new ConcurrentHashMap<String, IBasicScope>();

	/** Clients and connection map. */
	private final ConcurrentMap<IClient, Set<IConnection>> clients = new ConcurrentHashMap<IClient, Set<IConnection>>();

	/** Statistics about clients connected to the scope. */
	private final StatisticsCounter clientStats = new StatisticsCounter();

	/** Statistics about connections to the scope. */
	private final StatisticsCounter connectionStats = new StatisticsCounter();

	/** Scope context. */
	private IContext context;

	/** Timestamp the scope was created. */
	private long creationTime;

	/** Scope nesting depth, unset by default. */
	private int depth = UNSET;

	/** Whether scope is enabled. */
	private boolean enabled = true;

	/** Scope handler. */
	private IScopeHandler handler;

	/** Whether scope is running. */
	private boolean running;

	/** Registered service handlers for this scope. The map is created on-demand only if it's accessed for writing. */
	private volatile Map<String, Object> serviceHandlers;

	/** Statistics about subscopes. */
	private final StatisticsCounter subscopeStats = new StatisticsCounter();

	/** Mbean object name. */
	private ObjectName oName;

	/**
	 * Creates unnamed scope.
	 */
	public Scope() {
		this(null);
	}

	/**
	 * Creates scope with given name.
	 * 
	 * @param name Scope name
	 */
	public Scope(String name) {
		super(null, TYPE, name, false);
		creationTime = System.currentTimeMillis();
	}

	/**
	 * Add child scope to this scope.
	 * 
	 * @param scope Child scope
	 * 
	 * @return <code>true</code> on success (if scope has handler and it
	 * accepts child scope addition), <code>false</code> otherwise
	 */
	public boolean addChildScope(IBasicScope scope) {
		if (scope.getStore() == null) {
			// Child scope has no persistence store, use same class as parent.
			try {
				if (scope instanceof Scope) {
					((Scope) scope).setPersistenceClass(this.persistenceClass);
				}
			} catch (Exception error) {
				log.error("Could not set persistence class. {}", error);
			}
		}
		if (hasHandler() && !getHandler().addChildScope(scope)) {
			log.debug("Failed to add child scope: {} to {}", scope, this);
			return false;
		}
		if (scope instanceof IScope) {
			// start the scope
			if (hasHandler() && !getHandler().start((IScope) scope)) {
				log.debug("Failed to start child scope: {} in {}", scope, this);
				return false;
			}
		}
		if (scope instanceof IScope) {
			final IServer server = getServer();
			if (server instanceof Server) {
				((Server) server).notifyScopeCreated((IScope) scope);
			}
		}
		log.debug("Add child scope: {} to {}", scope, this);
		children.put(scope.getType() + SEPARATOR + scope.getName(), scope);
		return true;
	}

	/**
	 * Connect to scope.
	 * 
	 * @param conn Connection object
	 * 
	 * @return <code>true</code> on success, <code>false</code> otherwise
	 */
	public boolean connect(IConnection conn) {
		return connect(conn, null);
	}

	/**
	 * Connect to scope with parameters. To successfully connect to scope it
	 * must have handler that will accept this connection with given set of
	 * parameters. Client associated with connection is added to scope clients set,
	 * connection is registered as scope event listener.
	 * 
	 * @param conn Connection object
	 * @param params Parameters passed with connection
	 * 
	 * @return <code>true</code> on success, <code>false</code> otherwise
	 */
	public boolean connect(IConnection conn, Object[] params) {
		logger.debug("Has connection: {}", (conn != null));		
		logger.debug("Has handler: {}", (handler != null));
		logger.debug("Has parent: {}", (parent != null));		
		if (hasParent() && !parent.connect(conn, params)) {
			return false;
		}
		if (hasHandler() && !getHandler().connect(conn, this, params)) {
			return false;
		}
		final IClient client = conn.getClient();	
		if (!conn.isConnected()) {
			// Timeout while connecting client
			return false;
		}
		//we would not get this far if there is no handler
		if (hasHandler() && !getHandler().join(client, this)) {
		//if (!getHandler().join(client, this)) {
			return false;
		}
		//checking the connection again? why?
		if (!conn.isConnected()) {
			// Timeout while connecting client
			return false;
		}
		
		Set<IConnection> conns = clients.get(client);
		if (conns == null) {
			conns = new CopyOnWriteArraySet<IConnection>();
			clients.put(client, conns);
		}		
		conns.add(conn);
			
		clientStats.increment();
		addEventListener(conn);
		connectionStats.increment();

		if (this.equals(conn.getScope())) {
			final IServer server = getServer();
			if (server instanceof Server) {
				((Server) server).notifyConnected(conn);
			}
		}
		return true;
	}

	/**
	 * Create child scope with given name.
	 * 
	 * @param name Child scope name
	 * 
	 * @return <code>true</code> on success, <code>false</code> otherwise
	 */
	public boolean createChildScope(String name) {
		final Scope scope = new Scope(name);
		scope.setParent(this);
		subscopeStats.increment();
		return addChildScope(scope);
	}

	/**
	 * Destroys scope.
	 */
	public void destroy() {
		if (hasParent()) {
			parent.removeChildScope(this);
		}
		if (hasHandler()) {
			handler.stop(this);
			// TODO: kill all child scopes
		}
	}

	/**
	 * Disconnect connection from scope.
	 * 
	 * @param conn Connection object
	 */
	public void disconnect(IConnection conn) {
		// We call the disconnect handlers in reverse order they were called
		// during connection, i.e. roomDisconnect is called before
		// appDisconnect.
		final IClient client = conn.getClient();
		if (client == null) {
			// Early bail out
			removeEventListener(conn);
			connectionStats.decrement();
			if (hasParent()) {
				parent.disconnect(conn);
			}
			return;
		}
		
		final Set<IConnection> conns = clients.get(client);
		if (conns != null) {
			conns.remove(conn);
			IScopeHandler handler = null;
			if (hasHandler()) {
				handler = getHandler();
				try {
					handler.disconnect(conn, this);
				} catch (Exception e) {
					log.error("Error while executing \"disconnect\" for connection {} on handler {}. {}", new Object[]{conn, handler, e});
				}
			}
			if (conns.isEmpty()) {
				clients.remove(client);
				clientStats.decrement();
				if (handler != null) {
					try {
						// there may be a timeout here ?
						handler.leave(client, this);
					} catch (Exception e) {
						log.error("Error while executing \"leave\" for client {} on handler {}. {}", new Object[]{conn, handler, e});
					}
				}
			}
			removeEventListener(conn);
			connectionStats.decrement();

			if (this.equals(conn.getScope())) {
				final IServer server = getServer();
				if (server instanceof Server) {
					((Server) server).notifyDisconnected(conn);
				}
			}
		}
		if (hasParent()) {
			parent.disconnect(conn);
		}
	}

	/** {@inheritDoc} */
	@Override
	public void dispatchEvent(IEvent event) {
		Iterator<IConnection> conns = getConnections();
		while (conns.hasNext()) {
			try {
				conns.next().dispatchEvent(event);
			} catch (RuntimeException e) {
				log.error("{}", e);
			}
		}
	}

	/** {@inheritDoc} */
	public int getActiveClients() {
		return clients.size();
	}

	/** {@inheritDoc} */
	public int getActiveConnections() {
		return connectionStats.getCurrent();
	}

	/** {@inheritDoc} */
	public int getActiveSubscopes() {
		return subscopeStats.getCurrent();
	}

	/**
	 * Return base scope of given type with given name.
	 * 
	 * @param type Scope type
	 * @param name Scope name
	 * 
	 * @return Basic scope object
	 */
	public IBasicScope getBasicScope(String type, String name) {
		return children.get(type + SEPARATOR + name);
	}

	/**
	 * Return basic scope names iterator.
	 * 
	 * @param type Scope type
	 * 
	 * @return Iterator
	 */
	public Iterator<String> getBasicScopeNames(String type) {
		if (type == null) {
			return children.keySet().iterator();
		} else {
			return new PrefixFilteringStringIterator(children.keySet()
					.iterator(), type + SEPARATOR);
		}
	}

	/**
	 * Return current thread context classloader.
	 * 
	 * @return Current thread context classloader
	 */
	public ClassLoader getClassLoader() {
		return getContext().getClassLoader();
	}

	/**
	 * Return set of clients.
	 * 
	 * @return Set of clients bound to scope
	 */
	public Set<IClient> getClients() {
		return clients.keySet();
	}

	/**
	 * Return connection iterator.
	 * 
	 * @return Connections iterator
	 */
	public Iterator<IConnection> getConnections() {
		return new ConnectionIterator();
	}

	/**
	 * Return scope context. If scope doesn't have context, parent's context is
	 * returns, and so forth.
	 * 
	 * @return Scope context or parent context
	 */
	public IContext getContext() {
		if (!hasContext() && hasParent()) {
			//log.debug("returning parent context");
			return parent.getContext();
		} else {
			//log.debug("returning context");
			return context;
		}
	}

	/**
	 * Return scope context path.
	 * 
	 * @return Scope context path
	 */
	public String getContextPath() {
		if (hasContext()) {
			return "";
		} else if (hasParent()) {
			return parent.getContextPath() + '/' + name;
		} else {
			return null;
		}
	}

	/** {@inheritDoc} */
	public long getCreationTime() {
		return creationTime;
	}

	/**
	 * return scope depth.
	 * 
	 * @return Scope depth
	 */
	@Override
	public int getDepth() {
		if (depth == UNSET) {
			if (hasParent()) {
				depth = parent.getDepth() + 1;
			} else {
				depth = 0;
			}
		}
		return depth;
	}

	/**
	 * Return scope handler or parent's scope handler if this scope doesn't have
	 * one.
	 * 
	 * @return Scope handler (or parent's one)
	 */
	public IScopeHandler getHandler() {
		if (handler != null) {
			return handler;
		} else if (hasParent()) {
			return getParent().getHandler();
		} else {
			return null;
		}
	}

	/** {@inheritDoc} */
	public int getMaxClients() {
		return clientStats.getMax();
	}

	/** {@inheritDoc} */
	public int getMaxConnections() {
		return connectionStats.getMax();
	}

	/** {@inheritDoc} */
	public int getMaxSubscopes() {
		return subscopeStats.getMax();
	}

	/**
	 * Return parent scope.
	 * 
	 * @return Parent scope
	 */
	@Override
	public IScope getParent() {
		return parent;
	}

	/**
	 * Return scope path calculated from parent path and parent scope name.
	 * 
	 * @return Scope path
	 */
	@Override
	public String getPath() {
		if (hasParent()) {
			return parent.getPath() + '/' + parent.getName();
		} else {
			return "";
		}
	}

	/**
	 * Return resource located at given path.
	 * 
	 * @param path Resource path
	 * 
	 * @return Resource
	 */
	public Resource getResource(String path) {
		if (hasContext()) {
			return context.getResource(path);
		}
		return getContext().getResource(getContextPath() + '/' + path);
	}

	/**
	 * Return array of resources from path string, usually used with pattern
	 * path.
	 * 
	 * @param path Resources path
	 * 
	 * @return Resources
	 * 
	 * @throws IOException I/O exception
	 */
	public Resource[] getResources(String path) throws IOException {
		if (hasContext()) {
			return context.getResources(path);
		}
		return getContext().getResources(getContextPath() + '/' + path);
	}

	/**
	 * Return child scope by name.
	 * 
	 * @param name Scope name
	 * 
	 * @return Child scope with given name
	 */
	public IScope getScope(String name) {
		return (IScope) children.get(TYPE + SEPARATOR + name);
	}

	/**
	 * Return child scope names iterator.
	 * 
	 * @return Child scope names iterator
	 */
	public Iterator<String> getScopeNames() {
		return new PrefixFilteringStringIterator(children.keySet().iterator(),
				"scope");
	}

	/**
	 * Return service handler by name.
	 * 
	 * @param name Handler name
	 * 
	 * @return Service handler with given name
	 */
	public Object getServiceHandler(String name) {
		Map<String, Object> serviceHandlers = getServiceHandlers(false);
		if (serviceHandlers == null) {
			return null;
		}
		return serviceHandlers.get(name);
	}

	/**
	 * Return set of service handler names. Removing entries from the set
	 * unregisters the corresponding service handler.
	 * 
	 * @return Set of service handler names
	 */
	@SuppressWarnings("unchecked")
	public Set<String> getServiceHandlerNames() {
		Map<String, Object> serviceHandlers = getServiceHandlers(false);
		if (serviceHandlers == null) {
			return Collections.EMPTY_SET;
		}
		return serviceHandlers.keySet();
	}

	/**
	 * Return map of service handlers. The map is created if it doesn't exist
	 * yet.
	 * 
	 * @return Map of service handlers
	 */
	protected Map<String, Object> getServiceHandlers() {
		return getServiceHandlers(true);
	}

	/**
	 * Return map of service handlers and optionally created it if it doesn't
	 * exist.
	 * 
	 * @param allowCreate Should the map be created if it doesn't exist?
	 * 
	 * @return Map of service handlers
	 */
	protected Map<String, Object> getServiceHandlers(boolean allowCreate) {
		if (serviceHandlers == null) {
			if (!allowCreate)
				return null;

			// Only synchronize if potentially needs to be created
			synchronized (this) {
				if (serviceHandlers == null) {
					serviceHandlers = new ConcurrentHashMap<String, Object>();
				}
			}
		}
		return serviceHandlers;
	}

	/** {@inheritDoc} */
	public IScopeStatistics getStatistics() {
		return this;
	}

	/** {@inheritDoc} */
	public int getTotalClients() {
		return clientStats.getTotal();
	}

	/** {@inheritDoc} */
	public int getTotalConnections() {
		return connectionStats.getTotal();
	}

	/** {@inheritDoc} */
	public int getTotalSubscopes() {
		return subscopeStats.getTotal();
	}

	/**
	 * Handles event. To be implemented in subclasses.
	 * 
	 * @param event Event to handle
	 * 
	 * @return <code>true</code> on success, <code>false</code> otherwise
	 */
	@Override
	public boolean handleEvent(IEvent event) {
		return false;
	}

	/**
	 * Check whether scope has child scope with given name.
	 * 
	 * @param name Child scope name
	 * 
	 * @return <code>true</code> if scope has child node with given name,
	 * <code>false</code> otherwise
	 */
	public boolean hasChildScope(String name) {
		log.debug("Has child scope? {} in {}", name, this);
		// log.debug("Children: " + children);
		return children.containsKey(TYPE + SEPARATOR + name);
	}

	/**
	 * Check whether scope has child scope with given name and type.
	 * 
	 * @param type Child scope type
	 * @param name Child scope name
	 * 
	 * @return <code>true</code> if scope has child node with given name and
	 * type, <code>false</code> otherwise
	 */
	public boolean hasChildScope(String type, String name) {
		return children.containsKey(type + SEPARATOR + name);
	}

	/**
	 * Check if scope has a context.
	 * 
	 * @return <code>true</code> if scope has context, <code>false</code>
	 * otherwise
	 */
	public boolean hasContext() {
		return context != null;
	}

	/**
	 * Check if scope or it's parent has handler.
	 * 
	 * @return <code>true</code> if scope or it's parent scope has a handler,
	 * <code>false</code> otherwise
	 */
	public boolean hasHandler() {
		return (handler != null || (hasParent() && getParent().hasHandler()));
	}

	/**
	 * Check if scope has parent scope.
	 * 
	 * @return <code>true</code> if scope has parent scope, <code>false</code>
	 * otherwise`
	 */
	@Override
	public boolean hasParent() {
		return (parent != null);
	}

	/**
	 * Initialization actions, start if autostart is set to <code>true</code>.
	 */
	public void init() {
		if (hasParent()) {
			if (!parent.hasChildScope(name)) {
				if (!parent.addChildScope(this)) {
					return;
				}
			}
		}
		if (autoStart) {
			start();
		}
	}

	/**
	 * Uninitialize scope and unregister from parent.
	 */
	public void uninit() {
		for (IBasicScope child : children.values()) {
			if (child instanceof Scope) {
				((Scope) child).uninit();
			}
		}
		stop();
		if (hasParent()) {
			if (parent.hasChildScope(name)) {
				parent.removeChildScope(this);
			}
		}
	}

	/**
	 * Check if scope is enabled.
	 * 
	 * @return <code>true</code> if scope is enabled, <code>false</code>
	 * otherwise
	 */
	public boolean isEnabled() {
		return enabled;
	}

	/**
	 * Check if scope is in running state.
	 * 
	 * @return <code>true</code> if scope is in running state,
	 * <code>false</code> otherwise
	 */
	public boolean isRunning() {
		return running;
	}

	/**
	 * Child scopes iterator.
	 * 
	 * @return Child scopes iterator
	 */
	@Override
	public Iterator<IBasicScope> iterator() {
		return children.values().iterator();
	}

	/**
	 * Looks up connections for client.
	 * 
	 * @param client Client
	 * 
	 * @return Connection
	 */
	public Set<IConnection> lookupConnections(IClient client) {
		return clients.get(client);
	}

	/**
	 * Register service handler by name.
	 * 
	 * @param name Service handler name
	 * @param handler Service handler
	 */
	public void registerServiceHandler(String name, Object handler) {
		Map<String, Object> serviceHandlers = getServiceHandlers();
		serviceHandlers.put(name, handler);
	}

	/**
	 * Removes child scope.
	 * 
	 * @param scope Child scope to remove
	 */
	public void removeChildScope(IBasicScope scope) {
		if (scope instanceof IScope) {
			if (hasHandler()) {
				getHandler().stop((IScope) scope);
			}
			subscopeStats.decrement();
		}
		children.remove(scope.getType() + SEPARATOR + scope.getName());
		if (hasHandler()) {
			log.debug("Remove child scope");
			getHandler().removeChildScope(scope);
		}
		scope.setStore(null);

		if (scope instanceof IScope) {
			final IServer server = getServer();
			if (server instanceof Server) {
				((Server) server).notifyScopeRemoved((IScope) scope);
			}
		}
	}

	/**
	 * Setter for autostart flag.
	 * 
	 * @param autoStart Autostart flag value
	 */
	public void setAutoStart(boolean autoStart) {
		this.autoStart = autoStart;
	}

	/**
	 * Setter for child load path. Should be implemented in subclasses?
	 * 
	 * @param pattern Load path pattern
	 */
	public void setChildLoadPath(String pattern) {

	}

	/**
	 * Setter for context.
	 * 
	 * @param context Context object
	 */
	public void setContext(IContext context) {
		this.context = context;
	}

	/**
	 * Set scope depth.
	 * 
	 * @param depth Scope depth
	 */
	public void setDepth(int depth) {
		this.depth = depth;
	}

	/**
	 * Enable or disable scope by setting enable flag.
	 * 
	 * @param enabled Enable flag value
	 */
	public void setEnabled(boolean enabled) {
		this.enabled = enabled;
	}

	/**
	 * Setter for scope event handler.
	 * 
	 * @param handler Event handler
	 */
	public void setHandler(IScopeHandler handler) {
		this.handler = handler;
		if (handler instanceof IScopeAware) {
			((IScopeAware) handler).setScope(this);
		}
	}

	/**
	 * Setter for scope name.
	 * 
	 * @param name Scope name
	 */
	@Override
	public void setName(String name) {
		if (oName != null) {
			JMXAgent.unregisterMBean(oName);
			oName = null;
		}
		this.name = name;

		if (name != null) {
			try {
				oName = new ObjectName(JMXFactory.getDefaultDomain() + ":type="
						+ getClass().getName() + ",name=" + name);
			} catch (MalformedObjectNameException e) {
				log.error("Invalid object name. {}", e);
			}
			JMXAgent.registerMBean(this, this.getClass().getName(),
					ScopeMBean.class, oName);
		}
	}

	/**
	 * Setter for parent scope.
	 * 
	 * @param parent Parent scope
	 */
	public void setParent(IScope parent) {
		this.parent = parent;
	}

	/**
	 * Set scope persistence class.
	 * 
	 * @param persistenceClass Scope's persistence class
	 * 
	 * @throws Exception Exception
	 */
	public void setPersistenceClass(String persistenceClass) throws Exception {
		this.persistenceClass = persistenceClass;
		if (persistenceClass != null) {
			setStore(PersistenceUtils.getPersistenceStore(this,
					persistenceClass));
		} else {
			setStore(null);
		}
	}

	/**
	 * Starts scope.
	 * 
	 * @return <code>true</code> if scope has handler and it's start method
	 * returned true, <code>false</code> otherwise
	 */
	public synchronized boolean start() {
		boolean result = false;
		if (enabled && !running) {
			if (hasHandler()) {
				// Only start if scope handler allows it
				try {
					// if we dont have a handler of our own dont try to start it
					if (handler != null) {
						result = handler.start(this);
					}
				} catch (Throwable e) {
					log.error("Could not start scope {}. {}", this, e);
				}
			} else {
				// Always start scopes without handlers
				log.debug("Scope {} has no handler, allowing start.", this);
				result = true;
			}
			running = result;
		}
		return result;
	}

	/**
	 * Stops scope.
	 */
	public synchronized void stop() {
		if (enabled && running && hasHandler()) {
			try {
				// if we dont have a handler of our own dont try to stop it
				if (handler != null) {
					handler.stop(this);
				}
			} catch (Throwable e) {
				log.error("Could not stop scope " + this, e);
			}
		}
		running = false;
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public String toString() {
		final ToStringCreator tsc = new ToStringCreator(this);
		return tsc.append("Depth", getDepth()).append("Path", getPath())
				.append("Name", getName()).toString();
	}

	/**
	 * Unregisters service handler by name.
	 * 
	 * @param name Service handler name
	 */
	public void unregisterServiceHandler(String name) {
		Map<String, Object> serviceHandlers = getServiceHandlers(false);
		if (serviceHandlers == null) {
			return;
		}
		serviceHandlers.remove(name);
	}

	/**
	 * Return the server instance connected to this scope.
	 * 
	 * @return the server instance
	 */
	public IServer getServer() {
		if (!hasParent()) {
			return null;
        }
		final IScope parent = getParent();
		if (parent instanceof Scope) {
			return ((Scope) parent).getServer();
		} else if (parent instanceof IGlobalScope) {
			return ((IGlobalScope) parent).getServer();
		} else {
			return null;
		}
	}

}
