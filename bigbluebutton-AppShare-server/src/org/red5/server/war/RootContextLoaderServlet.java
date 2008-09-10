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
import java.rmi.Naming;
import java.rmi.RMISecurityManager;
import java.rmi.RemoteException;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.sql.Driver;
import java.sql.DriverManager;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.Timer;
import java.util.TimerTask;

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
import org.red5.server.service.ServiceInvoker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.access.BeanFactoryReference;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.context.access.ContextBeanFactoryReference;
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
public class RootContextLoaderServlet extends ContextLoaderListener {

	/** The Constant serialVersionUID. */
	private final static long serialVersionUID = 41919712007L;

	/** The my classloader. */
	private static ClassLoader myClassloader;

	// Initialize Logging
	/** The logger. */
	public static Logger logger = LoggerFactory
			.getLogger(RootContextLoaderServlet.class);

	/** The timer. */
	private static Timer timer;

	/** The check scope list. */
	private CheckScopeListTask checkScopeList;

	/** The registered contexts. */
	private static ArrayList<ServletContext> registeredContexts = new ArrayList<ServletContext>(
			3);

	/** The application context. */
	private ConfigurableWebApplicationContext applicationContext;

	/** The parent factory. */
	private DefaultListableBeanFactory parentFactory;

	/** The servlet context. */
	private static ServletContext servletContext;

	/** The instance. */
	private static RootContextLoaderServlet instance;

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

	/** The rmi port. */
	protected Integer rmiPort = 1099;

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
		instance = this;
		System.setProperty("red5.deployment.type", "war");

		myClassloader = getClass().getClassLoader();

		servletContext = sce.getServletContext();
		String prefix = servletContext.getRealPath("/");

		servletContext.setAttribute("root.classloader", myClassloader);

		initRegistry(servletContext);

		long time = System.currentTimeMillis();

		logger.info("RED5 Server (http://www.osflash.org/red5)");
		logger.info("Root context loader");
		logger.debug("Path: " + prefix);

		try {
			// instance the context loader
			ContextLoader loader = createContextLoader();
			applicationContext = (ConfigurableWebApplicationContext) loader
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

			// create a wrapper around our primary context
			BeanFactoryReference beanfactoryRef = new ContextBeanFactoryReference(
					applicationContext);

			// set it in the root servlet context
			servletContext.setAttribute("bean.factory.ref", beanfactoryRef);

			// set a remoting codec factory for AMF use
			servletContext.setAttribute("remoting.codec.factory", parentFactory
					.getBean("remotingCodecFactory"));

			server = (Server) parentFactory.getBean("red5.server");

			clientRegistry = (ClientRegistry) factory
					.getBean("global.clientRegistry");

			globalInvoker = (ServiceInvoker) factory
					.getBean("global.serviceInvoker");

			globalStrategy = (MappingStrategy) factory
					.getBean("global.mappingStrategy");

			global = (GlobalScope) factory.getBean("global.scope");
			logger.debug("GlobalScope: " + global);
			global.setServer(server);
			global.register();
			global.start();

			globalResolver = new ScopeResolver();
			globalResolver.setGlobalScope(global);

			logger.debug("About to grab Webcontext bean for Global");
			Context globalContext = (Context) factory.getBean("global.context");
			globalContext.setCoreBeanFactory(parentFactory);
			globalContext.setClientRegistry(clientRegistry);
			globalContext.setServiceInvoker(globalInvoker);
			globalContext.setScopeResolver(globalResolver);
			globalContext.setMappingStrategy(globalStrategy);

			logger.debug("About to grab Webcontext bean for ROOT");
			Context webContext = (Context) factory.getBean("web.context");
			webContext.setCoreBeanFactory(parentFactory);
			webContext.setClientRegistry(clientRegistry);
			webContext.setServiceInvoker(globalInvoker);
			webContext.setScopeResolver(globalResolver);
			webContext.setMappingStrategy(globalStrategy);

			WebScope scope = (WebScope) factory.getBean("web.scope");
			scope.setServer(server);
			scope.setParent(global);
			scope.register();
			scope.start();

			// grab the scope list (other war/webapps)
			IRemotableList remote = (IRemotableList) Naming
					.lookup("rmi://localhost:" + rmiPort + "/subContextList");
			logger.debug("Children: " + remote.numChildren());
			if (remote.hasChildren()) {
				logger.debug("Children were detected");
				for (int i = 0; i < remote.numChildren(); i++) {
					logger.debug("Enumerating children");
					WebSettings settings = remote.getAt(i);
					registerSubContext(settings.getWebAppKey());
				}
				logger.debug("End of children...");
			}

		} catch (Throwable t) {
			logger.error("", t);
		} finally {
			timer = new Timer();
			checkScopeList = new CheckScopeListTask();
			timer.scheduleAtFixedRate(checkScopeList, 1000, 30000);
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
		logger.info("Registering subcontext for servlet context: "
				+ ctx.getContextPath());
		if (registeredContexts.contains(ctx)) {
			logger.debug("Context is already registered: " + webAppKey);
			return;
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

	/**
	 * Clearing the in-memory configuration parameters, we will receive
	 * notification that the servlet context is about to be shut down.
	 * 
	 * @param sce the sce
	 */
	@Override
	public void contextDestroyed(ServletContextEvent sce) {
		synchronized (instance) {
			logger.info("Webapp shutdown");
			// XXX Paul: grabbed this from
			// http://opensource.atlassian.com/confluence/spring/display/DISC/Memory+leak+-+classloader+won%27t+let+go
			// in hopes that we can clear all the issues with J2EE containers
			// during shutdown
			try {
				ServletContext ctx = sce.getServletContext();
				// if the ctx being destroyed is root then kill the timer
				if (ctx.getContextPath().equals("/ROOT")) {
					timer.cancel();
				} else {
					// remove from registered list
					registeredContexts.remove(ctx);
				}
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
				// shutdown spring
				Object attr = ctx
						.getAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE);
				if (attr != null) {
					// get web application context from the servlet context
					ConfigurableWebApplicationContext applicationContext = (ConfigurableWebApplicationContext) attr;
					ConfigurableBeanFactory factory = applicationContext
							.getBeanFactory();
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

					ctx
							.removeAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE);
					applicationContext.close();
				}
				instance.getContextLoader().closeWebApplicationContext(ctx);
			} catch (Throwable e) {
				e.printStackTrace();
			} finally {
				// http://jakarta.apache.org/commons/logging/guide.html#Classloader_and_Memory_Management
				// http://wiki.apache.org/jakarta-commons/Logging/UndeployMemoryLeak?action=print
				// LogFactory.release(Thread.currentThread().getContextClassLoader());
			}
		}
	}

	/**
	 * Inits the registry.
	 * 
	 * @param ctx the ctx
	 */
	protected void initRegistry(ServletContext ctx) {
		Registry r = null;
		try {
			Object o = ctx.getInitParameter("rmiPort");
			if (o != null) {
				rmiPort = Integer.valueOf((String) o);
			}
			if (System.getSecurityManager() != null) {
				System.setSecurityManager(new RMISecurityManager());
			}
			// lookup the registry
			r = LocateRegistry.getRegistry(rmiPort);
			// ensure we are not already registered with the registry
			for (String regName : r.list()) {
				logger.debug("Registry entry: " + regName);
			}
		} catch (RemoteException re) {
			logger.info("RMI Registry server was not found on port " + rmiPort);
			// if we didnt find the registry and the user wants it created
			try {
				logger.info("Starting an internal RMI registry");
				// create registry for rmi
				r = LocateRegistry.createRegistry(rmiPort);
			} catch (RemoteException e) {
				logger.info("RMI Registry server was not started on port "
						+ rmiPort);
			}

		}
	}

	/**
	 * Task to check the scope list periodically for new contexts.
	 */
	public final class CheckScopeListTask extends TimerTask {
		
		/* (non-Javadoc)
		 * @see java.util.TimerTask#run()
		 */
		@Override
		public void run() {
			logger.debug("Checking scope list");
			try {
				// grab the scope list (other war/webapps)
				IRemotableList remote = (IRemotableList) Naming
						.lookup("rmi://localhost:" + rmiPort
								+ "/subContextList");
				logger.debug("Children: " + remote.numChildren());
				if (remote.hasChildren()) {
					logger.debug("Children were detected");
					for (int i = 0; i < remote.numChildren(); i++) {
						logger.debug("Enumerating children");
						WebSettings settings = remote.getAt(i);
						registerSubContext(settings.getWebAppKey());
					}
					logger.debug("End of children...");
				}
			} catch (Throwable t) {
				logger.error("", t);
			}
		}
	}

}
