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

import java.rmi.Naming;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.context.ContextLoader;

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
public class SubContextLoaderServlet extends RootContextLoaderServlet {

	/** The Constant serialVersionUID. */
	private final static long serialVersionUID = 41919712007L;

	// Initialize Logging
	/** The logger. */
	public static Logger logger = LoggerFactory
			.getLogger(SubContextLoaderServlet.class);

	/** The servlet context. */
	private static ServletContext servletContext;

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

		initRegistry(servletContext);

		long time = System.currentTimeMillis();

		logger.info("RED5 Server subcontext loader");
		logger.debug("Path: " + prefix);

		try {
			String[] configArray = servletContext.getInitParameter(
					ContextLoader.CONFIG_LOCATION_PARAM).split("[,\\s]");
			logger.debug("Config location files: " + configArray.length);

			WebSettings settings = new WebSettings();
			settings.setPath(prefix);
			// prefix the config file paths so they can be found later
			String[] subConfigs = new String[configArray.length];
			for (int s = 0; s < configArray.length; s++) {
				String cfg = "file:/" + prefix + configArray[s];
				logger.debug("Sub config location: " + cfg);
				subConfigs[s] = cfg;
			}
			settings.setConfigs(subConfigs);
			settings.setWebAppKey(servletContext
					.getInitParameter("webAppRootKey"));

			// store this contexts settings in the registry
			IRemotableList remote = null;
			boolean firstReg = false;
			try {
				remote = (IRemotableList) Naming.lookup("rmi://localhost:"
						+ rmiPort + "/subContextList");
			} catch (Exception e) {
				logger.warn("Lookup failed: " + e.getMessage());
			}
			if (remote == null) {
				remote = new RemotableList();
				firstReg = true;
			}
			logger.debug("Adding child web settings");
			remote.addChild(settings);
			logger.debug("Remote list size: " + remote.numChildren());
			if (firstReg) {
				Naming.bind("rmi://localhost:" + rmiPort + "/subContextList",
						remote);
			} else {
				Naming.rebind("rmi://localhost:" + rmiPort + "/subContextList",
						remote);
			}

		} catch (Throwable t) {
			logger.error("", t);
		}

		long startupIn = System.currentTimeMillis() - time;
		logger.info("Startup done in: " + startupIn + " ms");

	}

}
