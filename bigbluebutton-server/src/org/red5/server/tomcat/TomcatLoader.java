package org.red5.server.tomcat;

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

import java.io.File;
import java.io.FilenameFilter;
import java.util.List;
import java.util.Map;

import org.apache.catalina.Container;
import org.apache.catalina.Engine;
import org.apache.catalina.Host;
import org.apache.catalina.Realm;
import org.apache.catalina.Valve;
import org.apache.catalina.connector.Connector;
import org.apache.catalina.core.StandardHost;
import org.apache.catalina.startup.Embedded;
import org.red5.server.LoaderBase;
import org.red5.server.LoaderMBean;
import org.red5.server.jmx.JMXAgent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;

// TODO: Auto-generated Javadoc
/**
 * Red5 loader for Tomcat.
 */
public class TomcatLoader extends LoaderBase implements
		ApplicationContextAware, LoaderMBean {
	
	/**
	 * Filters directory content.
	 */
	class DirectoryFilter implements FilenameFilter {
		
		/**
		 * Check whether file matches filter rules.
		 * 
		 * @param dir Dir
		 * @param name File name
		 * 
		 * @return true If file does match filter rules, false otherwise
		 */
		public boolean accept(File dir, String name) {
			File f = new File(dir, name);
			if (log.isDebugEnabled()) {
				log.debug("Filtering: " + dir.getName() + " name: " + name);
				log.debug("Constructed dir: " + f.getAbsolutePath());
			}
			// filter out all non-directories that are hidden and/or not
			// readable
			return f.isDirectory() && f.canRead() && !f.isHidden();
		}
	}

	/** We store the application context in a ThreadLocal so we can access it later. */
	protected static ThreadLocal<ApplicationContext> applicationContext = new ThreadLocal<ApplicationContext>();

	// Initialize Logging
	/** The log. */
	protected static Logger log = LoggerFactory.getLogger(TomcatLoader.class);
	static {
		log.info("Init tomcat");
		// root location for servlet container
		String serverRoot = System.getProperty("red5.root");
		log.info("Server root: " + serverRoot);
		String confRoot = System.getProperty("red5.config_root");
		log.info("Config root: " + confRoot);
		// set in the system for tomcat classes
		System.setProperty("tomcat.home", serverRoot);
		System.setProperty("catalina.home", serverRoot);
		System.setProperty("catalina.base", serverRoot);
	}

	/** Base container host. */
	private Host baseHost;

	/** Tomcat connector. */
	protected Connector connector;

	/** Embedded Tomcat service (like Catalina). */
	protected Embedded embedded;

	/** Tomcat engine. */
	protected Engine engine;

	/** Tomcat realm. */
	protected Realm realm;

	{
		JMXAgent.registerMBean(this, this.getClass().getName(),
				LoaderMBean.class);
	}

	/**
	 * Add context from path and docbase.
	 * 
	 * @param path 	Path
	 * @param docBase Docbase
	 * 
	 * @return 		Catalina context (that is, web application)
	 */
	public org.apache.catalina.Context addContext(String path, String docBase) {
		org.apache.catalina.Context c = embedded.createContext(path, docBase);
		baseHost.addChild(c);
		LoaderBase.setRed5ApplicationContext(path,
				new TomcatApplicationContext(c));
		return c;
	}

	/**
	 * Get base host.
	 * 
	 * @return Base host
	 */
	public Host getBaseHost() {
		return baseHost;
	}

	/**
	 * Return connector.
	 * 
	 * @return Connector
	 */
	public Connector getConnector() {
		return connector;
	}

	/**
	 * Getter for embedded object.
	 * 
	 * @return Embedded object
	 */
	public Embedded getEmbedded() {
		return embedded;
	}

	/**
	 * Return Tomcat engine.
	 * 
	 * @return Tomcat engine
	 */
	public Engine getEngine() {
		return engine;
	}

	/**
	 * Getter for realm.
	 * 
	 * @return Realm
	 */
	public Realm getRealm() {
		return realm;
	}

	/**
	 * Initialization.
	 */
	public void init() {
		log.info("Loading tomcat context");

		try {
			getApplicationContext();
		} catch (Exception e) {
			log.error("Error loading tomcat configuration", e);
		}

		if (webappFolder == null) {
			// Use default webapps directory
			webappFolder = System.getProperty("red5.root") + "/webapps";
		}
		System.setProperty("red5.webapp.root", webappFolder);
		log.info("Application root: " + webappFolder);

		// scan for additional webapp contexts
		if (log.isDebugEnabled()) {
			log.debug("Approot: " + webappFolder);

		}
		// Root applications directory
		File appDirBase = new File(webappFolder);
		// Subdirs of root apps dir
		File[] dirs = appDirBase.listFiles(new DirectoryFilter());
		// Search for additional context files
		for (File dir : dirs) {
			String dirName = '/' + dir.getName();
			// check to see if the directory is already mapped
			if (null == baseHost.findChild(dirName)) {
				if (log.isDebugEnabled()) {
					log.debug("Adding context from directory scan: " + dirName);
				}
				this.addContext(dirName, webappFolder + '/' + dirName);
			}
		}

		// Dump context list
		if (log.isDebugEnabled()) {
			for (Container cont : baseHost.findChildren()) {
				log.debug("Context child name: " + cont.getName());
			}
		}
		// Set a realm
		embedded.setRealm(realm);

		// Don't start Tomcats jndi
		embedded.setUseNaming(false);

		// baseHost = embedded.createHost(hostName, appRoot);
		engine.addChild(baseHost);

		// Add new Engine to set of Engine for embedded server
		embedded.addEngine(engine);

		// Add new Connector to set of Connectors for embedded server,
		// associated with Engine
		embedded.addConnector(connector);

		setApplicationLoader(new TomcatApplicationLoader(embedded, baseHost, applicationContext.get()));

		// Start server
		try {
			log.info("Starting Tomcat servlet engine");
			embedded.start();
		} catch (org.apache.catalina.LifecycleException e) {
			log.error("Error loading Tomcat", e);
		}
	}

	/**
	 * Setter for application context.
	 * 
	 * @param context Application context
	 * 
	 * @throws BeansException Abstract superclass for all exceptions thrown in the beans
	 * package and subpackages
	 */
	public void setApplicationContext(ApplicationContext context)
			throws BeansException {
		applicationContext.set(context);
	}

	/**
	 * Set base host.
	 * 
	 * @param baseHost Base host
	 */
	public void setBaseHost(Host baseHost) {
		log.debug("setBaseHost");
		this.baseHost = baseHost;
	}

	/**
	 * Set connector.
	 * 
	 * @param connector Connector
	 */
	public void setConnector(Connector connector) {
		log.info("Setting connector: " + connector.getClass().getName());
		this.connector = connector;
	}

	/**
	 * Set additional connectors.
	 * 
	 * @param connectors Additional connectors
	 */
	public void setConnectors(List<Connector> connectors) {
		if (log.isDebugEnabled()) {
			log.debug("setConnectors: " + connectors.size());
		}
		for (Connector ctr : connectors) {
			embedded.addConnector(ctr);
		}
	}

	/**
	 * Set additional contexts.
	 * 
	 * @param contexts Map of contexts
	 */
	public void setContexts(Map<String, String> contexts) {
		if (log.isDebugEnabled()) {
			log.debug("setContexts: " + contexts.size());
		}
		for (String key : contexts.keySet()) {
			baseHost.addChild(embedded.createContext(key, webappFolder
					+ contexts.get(key)));
		}
	}

	/**
	 * Setter for embedded object.
	 * 
	 * @param embedded Embedded object
	 */
	public void setEmbedded(Embedded embedded) {
		log.info("Setting embedded: " + embedded.getClass().getName());
		this.embedded = embedded;
	}

	/**
	 * Set Tomcat engine implementation.
	 * 
	 * @param engine Tomcat engine
	 */
	public void setEngine(Engine engine) {
		log.info("Setting engine: " + engine.getClass().getName());
		this.engine = engine;
	}

	/**
	 * Set additional hosts.
	 * 
	 * @param hosts List of hosts added to engine
	 */
	public void setHosts(List<Host> hosts) {
		if (log.isDebugEnabled()) {
			log.debug("setHosts: " + hosts.size());
		}
		for (Host host : hosts) {
			engine.addChild(host);
		}
	}

	/**
	 * Setter for realm.
	 * 
	 * @param realm Realm
	 */
	public void setRealm(Realm realm) {
		log.info("Setting realm: " + realm.getClass().getName());
		this.realm = realm;
	}

	/**
	 * Set additional valves.
	 * 
	 * @param valves List of valves
	 */
	public void setValves(List<Valve> valves) {
		if (log.isDebugEnabled()) {
			log.debug("setValves: " + valves.size());
		}
		for (Valve valve : valves) {
			((StandardHost) baseHost).addValve(valve);
		}
	}

	/**
	 * Shut server down.
	 */
	public void shutdown() {
		log.info("Shutting down Tomcat context");
		JMXAgent.shutdown();
		try {
			embedded.stop();
			System.exit(0);
		} catch (Exception e) {
			log.warn("Tomcat could not be stopped", e);
			System.exit(1);
		}
	}

}