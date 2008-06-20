package org.red5.server.war;

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

import java.beans.Introspector;
import java.sql.Driver;
import java.sql.DriverManager;
import java.util.ArrayList;
import java.util.Enumeration;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;

import org.red5.server.ClientRegistry;
import org.red5.server.Context;
import org.red5.server.GlobalScope;
import org.red5.server.MappingStrategy;
import org.red5.server.ScopeResolver;
import org.red5.server.Server;
import org.red5.server.WebScope;
import org.red5.server.jmx.JMXAgent;
import org.red5.server.persistence.FilePersistenceThread;
import org.red5.server.service.ServiceInvoker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.web.context.ConfigurableWebApplicationContext;
import org.springframework.web.context.ContextLoader;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.WebApplicationContext;

// TODO: Auto-generated Javadoc
/**
 * Entry point from which the server config file is loaded while running within
 * a J2EE application container.
 * 
 * This listener should be registered after Log4jConfigListener in web.xml, if
 * the latter is used.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Paul Gregoire (mondain@gmail.com)
 */
public class WarLoaderServlet extends ContextLoaderListener {

	/** The Constant serialVersionUID. */
	private final static long serialVersionUID = 41919712008L;

	// Initialize Logging
	/** The logger. */
	public static Logger logger = LoggerFactory
			.getLogger(WarLoaderServlet.class);

	/** The registered contexts. */
	private static ArrayList<ServletContext> registeredContexts = new ArrayList<ServletContext>(
			3);

	/** The application context. */
	private ConfigurableWebApplicationContext applicationContext;

	/** The parent factory. */
	private DefaultListableBeanFactory parentFactory;

	/** The servlet context. */
	private static ServletContext servletContext;

	/** The context loader. */
	private ContextLoader contextLoader;

	/** The client registry. */
	private ClientRegistry clientRegistry;

	/** The global invoker. */
	private ServiceInvoker globalInvoker;

	/** The global strategy. */
	private MappingStrategy globalStrategy;

	/** The global resolver. */
	private ScopeResolver globalResolver;

	/** The global. */
	private GlobalScope global;

	/** The server. */
	private Server server;

	/**
	 * Main entry point for the Red5 Server as a war.
	 * 
	 * @param sce the sce
	 */
	// Notification that the web application is ready to process requests
	@Override
	public void contextInitialized(ServletContextEvent sce) {
		if (null != servletContext) {
			return;
		}
		System.setProperty("red5.deployment.type", "war");

		servletContext = sce.getServletContext();
		String prefix = servletContext.getRealPath("/");

		long time = System.currentTimeMillis();

		logger.info("RED5 Server (http://www.osflash.org/red5)");
		logger.info("WAR loader");
		logger.debug("Path: " + prefix);

		try {
			// instance the context loader
			contextLoader = createContextLoader();
			applicationContext = (ConfigurableWebApplicationContext) contextLoader
					.initWebApplicationContext(servletContext);
			logger.debug("Root context path: "
					+ applicationContext.getServletContext().getContextPath());

			ConfigurableBeanFactory factory = applicationContext
					.getBeanFactory();

			// register default
			factory.registerSingleton("default.context", applicationContext);

			// get the main factory
			parentFactory = (DefaultListableBeanFactory) factory
					.getParentBeanFactory();

		} catch (Throwable t) {
			logger.error("", t);
		}

		long startupIn = System.currentTimeMillis() - time;
		logger.info("Startup done in: " + startupIn + " ms");

	}

	/*
	 * Registers a subcontext with red5
	 */
	/**
	 * Register sub context.
	 * 
	 * @param webAppKey the web app key
	 */
	public void registerSubContext(String webAppKey) {
		// get the sub contexts - servlet context
		ServletContext ctx = servletContext.getContext(webAppKey);
		if (ctx == null) {
			ctx = servletContext;
		}
		ContextLoader loader = new ContextLoader();
		ConfigurableWebApplicationContext appCtx = (ConfigurableWebApplicationContext) loader
				.initWebApplicationContext(ctx);
		appCtx.setParent(applicationContext);
		appCtx.refresh();

		ctx.setAttribute(
				WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE,
				appCtx);

		ConfigurableBeanFactory appFactory = appCtx.getBeanFactory();

		logger.debug("About to grab Webcontext bean for " + webAppKey);
		Context webContext = (Context) appCtx.getBean("web.context");
		webContext.setCoreBeanFactory(parentFactory);
		webContext.setClientRegistry(clientRegistry);
		webContext.setServiceInvoker(globalInvoker);
		webContext.setScopeResolver(globalResolver);
		webContext.setMappingStrategy(globalStrategy);

		WebScope scope = (WebScope) appFactory.getBean("web.scope");
		scope.setServer(server);
		scope.setParent(global);
		scope.register();
		scope.start();

		// register the context so we dont try to reinitialize it
		registeredContexts.add(ctx);

	}

	/* (non-Javadoc)
	 * @see org.springframework.web.context.ContextLoaderListener#getContextLoader()
	 */
	@Override
	public ContextLoader getContextLoader() {
		return this.contextLoader;
	}

	/**
	 * Clearing the in-memory configuration parameters, we will receive
	 * notification that the servlet context is about to be shut down.
	 * 
	 * @param sce the sce
	 */
	@Override
	public void contextDestroyed(ServletContextEvent sce) {
		synchronized (servletContext) {
			logger.info("Webapp shutdown");
			// XXX Paul: grabbed this from
			// http://opensource.atlassian.com/confluence/spring/display/DISC/Memory+leak+-+classloader+won%27t+let+go
			// in hopes that we can clear all the issues with J2EE containers
			// during shutdown
			try {
				ServletContext ctx = sce.getServletContext();
				// prepare spring for shutdown
				Introspector.flushCaches();
				// dereg any drivers
				for (Enumeration e = DriverManager.getDrivers(); e
						.hasMoreElements();) {
					Driver driver = (Driver) e.nextElement();
					if (driver.getClass().getClassLoader() == getClass()
							.getClassLoader()) {
						DriverManager.deregisterDriver(driver);
					}
				}
				// shutdown jmx
				JMXAgent.shutdown();
				// shutdown the persistence thread
				FilePersistenceThread persistenceThread = FilePersistenceThread.getInstance();
				if (persistenceThread != null) {
					persistenceThread.shutdown();
				}
				// shutdown spring
				Object attr = ctx.getAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE);
				if (attr != null) {
					// get web application context from the servlet context
					ConfigurableWebApplicationContext applicationContext = (ConfigurableWebApplicationContext) attr;
					ConfigurableBeanFactory factory = applicationContext.getBeanFactory();
					// for (String scope : factory.getRegisteredScopeNames()) {
					// logger.debug("Registered scope: " + scope);
					// }
					try {
						for (String singleton : factory.getSingletonNames()) {
							logger.debug("Registered singleton: " + singleton);
							factory.destroyScopedBean(singleton);
						}
					} catch (RuntimeException e) {
					}
					factory.destroySingletons();
					ctx.removeAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE);
					applicationContext.close();
				}
				getContextLoader().closeWebApplicationContext(ctx);
//				org.apache.commons.logging.LogFactory.releaseAll();
//				org.apache.log4j.LogManager.getLoggerRepository().shutdown();
//				org.apache.log4j.LogManager.shutdown();
			} catch (Throwable e) {
				e.printStackTrace();
			}
		}
	}

}
