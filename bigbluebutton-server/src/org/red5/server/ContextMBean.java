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

import org.red5.server.api.IClientRegistry;
import org.red5.server.api.IMappingStrategy;
import org.red5.server.api.IScope;
import org.red5.server.api.IScopeHandler;
import org.red5.server.api.persistence.IPersistenceStore;
import org.red5.server.api.service.IServiceInvoker;
import org.springframework.context.ApplicationContext;
import org.springframework.core.io.Resource;

// TODO: Auto-generated Javadoc
/**
 * {@inheritDoc}
 * 
 * <p>This is basic context implementation used by Red5.</p>
 */
public interface ContextMBean {

	/**
	 * Gets the global scope.
	 * 
	 * @return the global scope
	 */
	public IScope getGlobalScope();

	/**
	 * Resolve scope.
	 * 
	 * @param path the path
	 * 
	 * @return the i scope
	 */
	public IScope resolveScope(String path);

	/**
	 * Resolve scope.
	 * 
	 * @param root the root
	 * @param path the path
	 * 
	 * @return the i scope
	 */
	public IScope resolveScope(IScope root, String path);

	/**
	 * Gets the persistance store.
	 * 
	 * @return the persistance store
	 */
	public IPersistenceStore getPersistanceStore();

	/**
	 * Gets the application context.
	 * 
	 * @return the application context
	 */
	public ApplicationContext getApplicationContext();

	/**
	 * Sets the context path.
	 * 
	 * @param contextPath the new context path
	 */
	public void setContextPath(String contextPath);

	/**
	 * Gets the client registry.
	 * 
	 * @return the client registry
	 */
	public IClientRegistry getClientRegistry();

	/**
	 * Gets the scope.
	 * 
	 * @return the scope
	 */
	public IScope getScope();

	/**
	 * Gets the service invoker.
	 * 
	 * @return the service invoker
	 */
	public IServiceInvoker getServiceInvoker();

	/**
	 * Lookup service.
	 * 
	 * @param serviceName the service name
	 * 
	 * @return the object
	 */
	public Object lookupService(String serviceName);

	/**
	 * Lookup scope handler.
	 * 
	 * @param contextPath the context path
	 * 
	 * @return the i scope handler
	 */
	public IScopeHandler lookupScopeHandler(String contextPath);

	/**
	 * Gets the mapping strategy.
	 * 
	 * @return the mapping strategy
	 */
	public IMappingStrategy getMappingStrategy();

	/**
	 * Gets the resources.
	 * 
	 * @param pattern the pattern
	 * 
	 * @return the resources
	 * 
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public Resource[] getResources(String pattern) throws IOException;

	/**
	 * Gets the resource.
	 * 
	 * @param path the path
	 * 
	 * @return the resource
	 */
	public Resource getResource(String path);

	/**
	 * Resolve scope.
	 * 
	 * @param host the host
	 * @param path the path
	 * 
	 * @return the i scope
	 */
	public IScope resolveScope(String host, String path);

	/**
	 * Gets the bean.
	 * 
	 * @param beanId the bean id
	 * 
	 * @return the bean
	 */
	public Object getBean(String beanId);

	/**
	 * Gets the core service.
	 * 
	 * @param beanId the bean id
	 * 
	 * @return the core service
	 */
	public Object getCoreService(String beanId);

}
