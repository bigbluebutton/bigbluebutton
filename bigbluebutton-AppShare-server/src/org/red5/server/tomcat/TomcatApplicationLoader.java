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

import org.apache.catalina.Context;
import org.apache.catalina.Host;
import org.apache.catalina.startup.Embedded;
import org.red5.server.LoaderBase;
import org.red5.server.api.IApplicationLoader;
import org.springframework.context.ApplicationContext;

// TODO: Auto-generated Javadoc
/**
 * Class that can load new applications in Jetty.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public class TomcatApplicationLoader implements IApplicationLoader {

	/** Store reference to embedded Tomcat engine. */
	private Embedded embedded;
	
	/** Store reference to host Tomcat is running on. */
	private Host host;
	
	/** Stores reference to the root ApplicationContext. */
	private ApplicationContext rootCtx;
	
	/**
	 * Wrap Tomcat engine and host.
	 * 
	 * @param embedded the embedded
	 * @param host the host
	 * @param rootCtx the root ctx
	 */
	protected TomcatApplicationLoader(Embedded embedded, Host host, ApplicationContext rootCtx) {
		this.embedded = embedded;
		this.host = host;
		this.rootCtx = rootCtx;
	}

	/** {@inheritDoc} */
	public ApplicationContext getRootContext() {
		return rootCtx;
	}

	/** {@inheritDoc} */
	public void loadApplication(String contextPath, String virtualHosts, String directory)
			throws Exception {
		if (directory.startsWith("file:")) {
			directory = directory.substring(5);
		}
		// TODO: evaluate virtual hosts
		Context c = embedded.createContext(contextPath, directory);
		LoaderBase.setRed5ApplicationContext(contextPath, new TomcatApplicationContext(c));
		host.addChild(c);
	}

}
