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

import org.mortbay.jetty.Server;
import org.mortbay.jetty.webapp.WebAppContext;
import org.red5.server.api.IApplicationLoader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;

// TODO: Auto-generated Javadoc
/**
 * Class that can load new applications in Jetty.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public class JettyApplicationLoader implements IApplicationLoader {

    /** Logger. */
	protected static Logger log = LoggerFactory.getLogger(JettyApplicationContext.class);

	/** Stores reference to the Jetty server. */
	private Server server;
	
	/** Stores reference to the root ApplicationContext. */
	private ApplicationContext rootCtx;
	
	/**
	 * Create new application loader for Jetty servers.
	 * 
	 * @param server the server
	 * @param rootCtx the root ctx
	 */
	protected JettyApplicationLoader(Server server, ApplicationContext rootCtx) {
		this.server = server;
		this.rootCtx = rootCtx;
	}
	
	/** {@inheritDoc} */
	public ApplicationContext getRootContext() {
		return rootCtx;
	}
	
	/** {@inheritDoc} */
	public void loadApplication(String contextPath, String virtualHosts, String directory) throws Exception {
		String[] handlersArr = new String[] {
				"org.mortbay.jetty.webapp.WebInfConfiguration",
				"org.mortbay.jetty.webapp.WebXmlConfiguration",
				"org.mortbay.jetty.webapp.JettyWebXmlConfiguration",
				"org.mortbay.jetty.webapp.TagLibConfiguration",
				"org.red5.server.jetty.Red5WebPropertiesConfiguration" };

		WebAppContext context = new WebAppContext();
        // Get hostnames
        String[] hostnames = null;
        if (virtualHosts != null) {
        	hostnames = virtualHosts.split(",");
    		for (int i = 0; i < hostnames.length; i++) {
    			hostnames[i] = hostnames[i].trim();
    			if (hostnames[i].equals("*")) {
    				// A virtual host "null" must be used so requests for
    				// any host will be served.
    				hostnames = null;
    				break;
    			}
    		}
        }
		context.setContextPath(contextPath);
		context.setVirtualHosts(hostnames);
		context.setConfigurationClasses(handlersArr);
		context.setDefaultsDescriptor("web-default.xml");
		context.setExtractWAR(true);
		context.setWar(directory);
		context.setParentLoaderPriority(true);
		context.setServer(server);
		context.start();
	}

}
