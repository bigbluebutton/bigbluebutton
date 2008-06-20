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

import java.lang.reflect.Field;

import org.red5.server.api.persistence.IPersistable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;

// TODO: Auto-generated Javadoc
/**
 * Collection of utils for working with scopes.
 */
public class ScopeUtils {

	/** The Constant log. */
	private static final Logger log = LoggerFactory.getLogger(ScopeUtils.class);

	/** The Constant GLOBAL. */
	private static final int GLOBAL = 0x00;

	/** The Constant APPLICATION. */
	private static final int APPLICATION = 0x01;

	/** The Constant ROOM. */
	private static final int ROOM = 0x02;

	/** The Constant SERVICE_CACHE_PREFIX. */
	private static final String SERVICE_CACHE_PREFIX = "__service_cache:";

	/** Constant for slash symbol. */
	private static final String SLASH = "/";

	/**
	 * Resolves scope for specified scope and path.
	 * 
	 * @param from Scope to use as context (to start from)
	 * @param path Path to resolve
	 * 
	 * @return Resolved scope
	 */
	public static IScope resolveScope(IScope from, String path) {
		IScope current = from;
		if (path.startsWith(SLASH)) {
			current = ScopeUtils.findRoot(current);
			path = path.substring(1, path.length());
		}
		if (path.endsWith(SLASH)) {
			path = path.substring(0, path.length() - 1);
		}
		String[] parts = path.split(SLASH);
		for (String part : parts) {
			if (part.equals(".")) {
				continue;
			}
			if (part.equals("..")) {
				if (!current.hasParent()) {
					return null;
				}
				current = current.getParent();
				continue;
			}
			if (!current.hasChildScope(part)) {
				return null;
			}
			current = current.getScope(part);
		}
		return current;
	}

	/**
	 * Finds root scope for specified scope object. Root scope is the top level
	 * scope among scope's parents.
	 * 
	 * @param from Scope to find root for
	 * 
	 * @return Root scope object
	 */
	public static IScope findRoot(IScope from) {
		IScope current = from;
		while (current.hasParent()) {
			current = current.getParent();
		}
		return current;
	}

	/**
	 * Returns the application scope for specified scope. Application scope has
	 * depth of 1 and has no parent.
	 * 
	 * See <code>isApp</code> method for details.
	 * 
	 * @param from Scope to find application for
	 * 
	 * @return 	Application scope.
	 */
	public static IScope findApplication(IScope from) {
		IScope current = from;
		while (current.hasParent() && current.getDepth() != APPLICATION) {
			current = current.getParent();
		}
		return current;
	}

	/**
	 * Check whether one scope is an ancestor of another.
	 * 
	 * @param from Scope
	 * @param ancestor Scope to check
	 * 
	 * @return <code>true</code> if ancestor scope is really an ancestor of
	 * scope passed as from parameter, <code>false</code> otherwise.
	 */
	public static boolean isAncestor(IBasicScope from, IBasicScope ancestor) {
		IBasicScope current = from;
		while (current.hasParent()) {
			current = current.getParent();
			if (current.equals(ancestor)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Checks whether scope is root or not.
	 * 
	 * @param scope Scope to check
	 * 
	 * @return <code>true</code> if scope is root scope (top level scope),
	 * <code>false</code> otherwise.
	 */
	public static boolean isRoot(IBasicScope scope) {
		return !scope.hasParent();
	}

	/**
	 * Check whether scope is the global scope (level 0 leaf in scope tree) or
	 * not
	 * 
	 * When user connects the following URL: rtmp://localhost/myapp/foo/bar then /
	 * is the global level scope, myapp is app level, foo is room level and bar
	 * is room level as well (but with higher depth level).
	 * 
	 * @param scope Scope to check
	 * 
	 * @return <code>true</code> if scope is the global scope,
	 * <code>false</code> otherwise.
	 */
	public static boolean isGlobal(IBasicScope scope) {
		return scope.getDepth() == GLOBAL;
	}

	/**
	 * Check whether scope is an application scope (level 1 leaf in scope tree)
	 * or not.
	 * 
	 * @param scope Scope to check
	 * 
	 * @return <code>true</code> if scope is an application scope,
	 * <code>false</code> otherwise.
	 */
	public static boolean isApp(IBasicScope scope) {
		return scope.getDepth() == APPLICATION;
	}

	/**
	 * Check whether scope is a room scope (level 2 leaf in scope tree or lower,
	 * e.g. 3, 4, ...) or not
	 * 
	 * @param scope Scope to check
	 * 
	 * @return <code>true</code> if scope is a room scope, <code>false</code>
	 * otherwise.
	 */
	public static boolean isRoom(IBasicScope scope) {
		return scope.getDepth() >= ROOM;
	}

	/**
	 * Returns scope service by bean name. See overloaded method for details.
	 * 
	 * @param scope the scope
	 * @param name the name
	 * 
	 * @return the scope service
	 */
	protected static Object getScopeService(IScope scope, String name) {
		return getScopeService(scope, name, null);
	}

	/**
	 * Returns scope services (e.g. SharedObject, etc) for the scope. Method
	 * uses either bean name passes as a string or class object.
	 * 
	 * @param scope The scope service belongs to
	 * @param name Bean name
	 * @param defaultClass Class of service
	 * 
	 * @return 			Service object
	 */
	protected static Object getScopeService(IScope scope, String name,
			Class<?> defaultClass) {
		if (scope == null) {
			return null;
		}

		final IContext context = scope.getContext();
		ApplicationContext appCtx = context.getApplicationContext();
		Object result;
		if (!appCtx.containsBean(name)) {
			if (defaultClass == null) {
				return null;
			}

			try {
				result = defaultClass.newInstance();
			} catch (Exception e) {
				log.error("{}", e);
				return null;
			}
		} else {
			result = appCtx.getBean(name);
		}

		return result;
	}

	/**
	 * Returns scope service that implements a given interface.
	 * 
	 * @param scope The scope service belongs to
	 * @param intf The interface the service must implement
	 * 
	 * @return Service object
	 */
	public static Object getScopeService(IScope scope, Class<?> intf) {
		return getScopeService(scope, intf, null);
	}

	/**
	 * Gets the scope service.
	 * 
	 * @param scope the scope
	 * @param intf the intf
	 * @param checkHandler the check handler
	 * 
	 * @return the scope service
	 */
	public static Object getScopeService(IScope scope, Class<?> intf, boolean checkHandler) {
		return getScopeService(scope, intf, null, checkHandler);
	}

	/**
	 * Returns scope service that implements a given interface.
	 * 
	 * @param scope The scope service belongs to
	 * @param intf The interface the service must implement
	 * @param defaultClass Class that should be used to create a new service if no service was found.
	 * 
	 * @return Service object
	 */
	public static Object getScopeService(IScope scope, Class<?> intf,
			Class<?> defaultClass) {
		return getScopeService(scope, intf, defaultClass, true);
	}

	/**
	 * Gets the scope service.
	 * 
	 * @param scope the scope
	 * @param intf the intf
	 * @param defaultClass the default class
	 * @param checkHandler the check handler
	 * 
	 * @return the scope service
	 */
	public static Object getScopeService(IScope scope, Class<?> intf,
			Class<?> defaultClass, boolean checkHandler) {
		if (scope == null || intf == null) {
			return null;
		}
		// We expect an interface
		assert intf.isInterface();

		if (scope.hasAttribute(IPersistable.TRANSIENT_PREFIX
				+ SERVICE_CACHE_PREFIX + intf.getCanonicalName())) {
			// Return cached service
			return scope.getAttribute(IPersistable.TRANSIENT_PREFIX
					+ SERVICE_CACHE_PREFIX + intf.getCanonicalName());
		}

		Object handler = null;
		if (checkHandler) {
			IScope current = scope;
			while (current != null) {
				IScopeHandler scopeHandler = current.getHandler();
				if (intf.isInstance(scopeHandler)) {
					handler = scopeHandler;
					break;
				}

				if (!current.hasParent())
					break;

				current = current.getParent();
			}
		}

		if (handler == null && IScopeService.class.isAssignableFrom(intf)) {
			// We got an IScopeService, try to lookup bean
			Field key = null;
			Object serviceName = null;
			try {
				key = intf.getField("BEAN_NAME");
				serviceName = key.get(null);
				if (!(serviceName instanceof String))
					serviceName = null;
			} catch (Exception e) {
				log.debug("No string field 'BEAN_NAME' in that interface");
			}

			if (serviceName != null)
				handler = getScopeService(scope, (String) serviceName, defaultClass);
		}

		if (handler == null && defaultClass != null) {
			try {
				handler = defaultClass.newInstance();
			} catch (Exception e) {
				log.error("{}", e);
			}
		}

		// Cache service
		scope.setAttribute(IPersistable.TRANSIENT_PREFIX + SERVICE_CACHE_PREFIX
				+ intf.getCanonicalName(), handler);
		return handler;
	}

}
