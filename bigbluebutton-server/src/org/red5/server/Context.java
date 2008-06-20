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
import org.red5.server.api.IContext;
import org.red5.server.api.IGlobalScope;
import org.red5.server.api.IMappingStrategy;
import org.red5.server.api.IScope;
import org.red5.server.api.IScopeHandler;
import org.red5.server.api.IScopeResolver;
import org.red5.server.api.persistence.IPersistenceStore;
import org.red5.server.api.service.IServiceInvoker;
import org.red5.server.exception.ScopeHandlerNotFoundException;
import org.red5.server.service.ServiceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.access.ContextSingletonBeanFactoryLocator;
import org.springframework.core.io.Resource;

// TODO: Auto-generated Javadoc
/**
 * {@inheritDoc}
 * 
 * <p>
 * This is basic context implementation used by Red5.
 * </p>
 */
public class Context implements IContext, ApplicationContextAware, ContextMBean {

	// Initialize Logging
	/** The logger. */
	public static Logger logger = LoggerFactory.getLogger(Context.class);

	/** Spring application context. */
	private ApplicationContext applicationContext;

	/** Core context. */
	private BeanFactory coreContext;

	/** Context path. */
	private String contextPath = "";

	/** Scope resolver collaborator. */
	private IScopeResolver scopeResolver;

	/** Client registry. */
	private IClientRegistry clientRegistry;

	/** Service invoker collaborator. */
	private IServiceInvoker serviceInvoker;

	/** Mapping stategy collaborator. */
	private IMappingStrategy mappingStrategy;

	/** Persistence store. */
	private IPersistenceStore persistanceStore;

	/**
	 * Initializes core context bean factory using red5.core bean factory from
	 * red5.xml context
	 */
	public Context() {
	}

	/**
	 * Initializes app context and context path from given parameters.
	 * 
	 * @param context Application context
	 * @param contextPath Context path
	 */
	public Context(ApplicationContext context, String contextPath) {
		setApplicationContext(context);
		this.contextPath = contextPath;
	}

	/**
	 * Return global scope.
	 * 
	 * @return Global scope
	 */
	public IGlobalScope getGlobalScope() {
		return scopeResolver.getGlobalScope();
	}

	/**
	 * Return scope resolver.
	 * 
	 * @return scope resolver
	 */
	public IScopeResolver getScopeResolver() {
		return scopeResolver;
	}

	/**
	 * Resolves scope using scope resolver collaborator.
	 * 
	 * @param path Path to resolve
	 * 
	 * @return Scope resolution result
	 */
	public IScope resolveScope(String path) {
		return scopeResolver.resolveScope(path);
	}

	/**
	 * Resolves scope from given root using scope resolver.
	 * 
	 * @param root Scope to start from.
	 * @param path Path to resolve.
	 * 
	 * @return Scope resolution result.
	 */
	public IScope resolveScope(IScope root, String path) {
		return scopeResolver.resolveScope(root, path);
	}

	/**
	 * Setter for client registry.
	 * 
	 * @param clientRegistry Client registry
	 */
	public void setClientRegistry(IClientRegistry clientRegistry) {
		this.clientRegistry = clientRegistry;
	}

	/**
	 * Setter for mapping stategy.
	 * 
	 * @param mappingStrategy Mapping strategy
	 */
	public void setMappingStrategy(IMappingStrategy mappingStrategy) {
		this.mappingStrategy = mappingStrategy;
	}

	/**
	 * Setter for scope resolver.
	 * 
	 * @param scopeResolver Scope resolver used to resolve scopes
	 */
	public void setScopeResolver(IScopeResolver scopeResolver) {
		this.scopeResolver = scopeResolver;
	}

	/**
	 * Setter for service invoker.
	 * 
	 * @param serviceInvoker Service invoker object
	 */
	public void setServiceInvoker(IServiceInvoker serviceInvoker) {
		this.serviceInvoker = serviceInvoker;
	}

	/**
	 * Return persistence store.
	 * 
	 * @return Persistence store
	 */
	public IPersistenceStore getPersistanceStore() {
		return persistanceStore;
	}

	/**
	 * Setter for persistence store.
	 * 
	 * @param persistanceStore Persistence store
	 */
	public void setPersistanceStore(IPersistenceStore persistanceStore) {
		this.persistanceStore = persistanceStore;
	}

	/**
	 * Setter for application context.
	 * 
	 * @param context App context
	 */
	public void setApplicationContext(ApplicationContext context) {
		this.applicationContext = context;
		String deploymentType = System.getProperty("red5.deployment.type");
		logger.debug("Deployment type: " + deploymentType);
		if (deploymentType == null) {
			// standalone core context
			String config = System.getProperty("red5.conf_file");
			if (config == null) {
				config = "red5.xml";
			}
			coreContext = ContextSingletonBeanFactoryLocator.getInstance(
					config).useBeanFactory("red5.core").getFactory();
		} else {
			logger.info("Setting parent bean factory as core");
			coreContext = applicationContext.getParentBeanFactory();
		}
	}

	/**
	 * Return application context.
	 * 
	 * @return App context
	 */
	public ApplicationContext getApplicationContext() {
		return applicationContext;
	}

	/**
	 * Setter for context path. Adds slash at the end of path if there's no one
	 * 
	 * @param contextPath Context path
	 */
	public void setContextPath(String contextPath) {
		if (!contextPath.endsWith("/")) {
			contextPath += '/';
		}
		this.contextPath = contextPath;
	}

	/**
	 * Return client registry.
	 * 
	 * @return Client registry
	 */
	public IClientRegistry getClientRegistry() {
		return clientRegistry;
	}

	/**
	 * Return scope.
	 * 
	 * @return null
	 */
	public IScope getScope() {
		return null;
	}

	/**
	 * Return service invoker.
	 * 
	 * @return Service invoker
	 */
	public IServiceInvoker getServiceInvoker() {
		return serviceInvoker;
	}

	/**
	 * Look up service by name.
	 * 
	 * @param serviceName Service name
	 * 
	 * @return Service object
	 * 
	 * @throws ServiceNotFoundException When service found but null
	 * @throws NoSuchBeanDefinitionException When bean with given name doesn't exist
	 */
	public Object lookupService(String serviceName) {
		serviceName = getMappingStrategy().mapServiceName(serviceName);
		try {
			Object bean = applicationContext.getBean(serviceName);
			if (bean != null) {
				return bean;
			} else {
				throw new ServiceNotFoundException(serviceName);
			}
		} catch (NoSuchBeanDefinitionException err) {
			throw new ServiceNotFoundException(serviceName);
		}
	}

	/**
	 * Look up scope handler for context path.
	 * 
	 * @param contextPath Context path
	 * 
	 * @return Scope handler
	 * 
	 * @throws ScopeHandlerNotFoundException If there's no handler for given context path
	 */
	public IScopeHandler lookupScopeHandler(String contextPath) {
		// Get target scope handler name
		String scopeHandlerName = getMappingStrategy().mapScopeHandlerName(
				contextPath);
		// Get bean from bean factory
		Object bean = applicationContext.getBean(scopeHandlerName);
		if (bean != null && bean instanceof IScopeHandler) {
			return (IScopeHandler) bean;
		} else {
			throw new ScopeHandlerNotFoundException(scopeHandlerName);
		}
	}

	/**
	 * Return mapping strategy used by this context. Mapping strategy define
	 * naming rules (prefixes, postfixes, default application name, etc) for all
	 * named objects in context.
	 * 
	 * @return Mapping strategy
	 */
	public IMappingStrategy getMappingStrategy() {
		return mappingStrategy;
	}

	/**
	 * Return array or resournce that match given pattern.
	 * 
	 * @param pattern Pattern to check against
	 * 
	 * @return Array of Resource objects
	 * 
	 * @throws IOException On I/O exception
	 * 
	 * @see org.springframework.core.io.Resource
	 */
	public Resource[] getResources(String pattern) throws IOException {
		return applicationContext.getResources(contextPath + pattern);
	}

	/**
	 * Return resouce by path.
	 * 
	 * @param path Resource path
	 * 
	 * @return Resource
	 * 
	 * @see org.springframework.core.io.Resource
	 */
	public Resource getResource(String path) {
		return applicationContext.getResource(contextPath + path);
	}

	/**
	 * Resolve scope from host and path.
	 * 
	 * @param host Host
	 * @param path Path
	 * 
	 * @return Scope
	 * 
	 * @see org.red5.server.api.IScope
	 * @see org.red5.server.Scope
	 */
	public IScope resolveScope(String host, String path) {
		return scopeResolver.resolveScope(path);
	}

	/**
	 * Return bean instantiated by bean factory.
	 * 
	 * @param beanId Bean name
	 * 
	 * @return Instantiated bean
	 * 
	 * @see org.springframework.beans.factory.BeanFactory
	 */
	public Object getBean(String beanId) {
		// for war applications the "application" beans are not stored in the
		// sub-contexts, so look in the application context first and the core
		// context second
		Object bean = null;
		try {
			bean = applicationContext.getBean(beanId);
		} catch (NoSuchBeanDefinitionException e) {
			logger.info("Bean lookup failed for " + beanId
					+ " in the application context");
			logger.debug("", e);
		}
		if (bean == null) {
			bean = getCoreService(beanId);
		}
		return bean;
	}

	/**
	 * Return core Red5 service instantiated by core context bean factory.
	 * 
	 * @param beanId Bean name
	 * 
	 * @return Core Red5 service instantiated
	 * 
	 * @see org.springframework.beans.factory.BeanFactory
	 */
	public Object getCoreService(String beanId) {
		return coreContext.getBean(beanId);
	}

	/**
	 * Sets the core bean factory.
	 * 
	 * @param core the new core bean factory
	 */
	public void setCoreBeanFactory(BeanFactory core) {
		coreContext = core;
	}

	/**
	 * Return current thread's context classloader.
	 * 
	 * @return Classloder context of current thread
	 */
	public ClassLoader getClassLoader() {
		return applicationContext.getClassLoader();
	}

}
