package org.red5.server.jetty;

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

import org.mortbay.jetty.Handler;
import org.mortbay.jetty.Server;
import org.mortbay.jetty.deployer.WebAppDeployer;
import org.mortbay.jetty.handler.ContextHandlerCollection;
import org.mortbay.jetty.handler.DefaultHandler;
import org.mortbay.jetty.handler.HandlerCollection;
import org.red5.server.LoaderBase;
import org.red5.server.LoaderMBean;
import org.red5.server.jmx.JMXAgent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.support.ClassPathXmlApplicationContext;

// TODO: Auto-generated Javadoc
/**
 * Class that loads Red5 applications using Jetty.
 */
public class JettyLoader extends LoaderBase implements ApplicationContextAware, LoaderMBean {

	/** Logger. */
	protected static Logger log = LoggerFactory.getLogger(JettyLoader.class);

	/** Default web config filename. */
	protected String defaultWebConfig = "web-default.xml";

	/** IServer implementation. */
	protected Server jetty;
	
	/** Jetty config path. */
	protected String jettyConfig = "classpath:/jetty.xml";

	{
		JMXAgent.registerMBean(this, this.getClass().getName(),
				LoaderMBean.class);
	}

	/* (non-Javadoc)
	 * @see org.red5.server.LoaderMBean#init()
	 */
	@SuppressWarnings("all")
	public void init() {
		// So this class is left just starting jetty
		try {
			if (webappFolder == null) {
				// Use default webapps directory
				webappFolder = System.getProperty("red5.root") + "/webapps";
			}
			System.setProperty("red5.webapp.root", webappFolder);
			
			log.info("Loading jetty6 context from: " + jettyConfig);
			ApplicationContext appCtx = new ClassPathXmlApplicationContext(
					jettyConfig);
			// Get server bean from BeanFactory
			jetty = (Server) appCtx.getBean("Server");

			setApplicationLoader(new JettyApplicationLoader(jetty, applicationContext.get()));
			
			// root location for servlet container
			String serverRoot = System.getProperty("red5.root");
			if (log.isDebugEnabled()) {
				log.debug("Server root: " + serverRoot);
			}
			// set in the system for tomcat classes
			System.setProperty("jetty.home", serverRoot);
			System.setProperty("jetty.class.path", serverRoot + "/lib");

			log.info("Starting jetty servlet engine");

			String[] handlersArr = new String[] {
					"org.mortbay.jetty.webapp.WebInfConfiguration",
					"org.mortbay.jetty.webapp.WebXmlConfiguration",
					"org.mortbay.jetty.webapp.JettyWebXmlConfiguration",
					"org.mortbay.jetty.webapp.TagLibConfiguration",
					"org.red5.server.jetty.Red5WebPropertiesConfiguration" };

			// Handler collection
			HandlerCollection handlers = new HandlerCollection();
			handlers.setHandlers(new Handler[] {
					new ContextHandlerCollection(), new DefaultHandler() });
			jetty.setHandler(handlers);

			try {
				// Add web applications from web app root with web config
				HandlerCollection contexts = (HandlerCollection) jetty.getChildHandlerByClass(ContextHandlerCollection.class);
				if (contexts == null)
					contexts = (HandlerCollection) jetty.getChildHandlerByClass(HandlerCollection.class);
				
				WebAppDeployer deployer = new WebAppDeployer();
				deployer.setContexts(contexts);
				deployer.setWebAppDir(webappFolder);
				deployer.setDefaultsDescriptor(defaultWebConfig);
				deployer.setConfigurationClasses(handlersArr);
				deployer.setExtract(true);
				deployer.setParentLoaderPriority(true);
				deployer.start();
			} catch (IOException e) {
				log.error("{}", e);
			} catch (Exception e) {
				log.error("{}", e);
			}

			// Start Jetty
			jetty.start();

		} catch (Exception e) {
			log.error("Error loading jetty", e);
		}

	}

	/**
	 * App context.
	 * 
	 * @param context           App context
	 * 
	 * @throws BeansException   Bean exception
	 */
	public void setApplicationContext(ApplicationContext context)
			throws BeansException {
		applicationContext.set(context);
	}

	/**
	 * Shut server down.
	 */
	public void shutdown() {
		log.info("Shutting down jetty context");
		JMXAgent.shutdown();
		try {
			jetty.stop();
			System.exit(0);
		} catch (Exception e) {
			log.warn("Jetty could not be stopped", e);
			System.exit(1);
		}
	}

}
