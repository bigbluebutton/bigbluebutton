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

import java.io.File;
import java.util.HashMap;
import java.util.Map;

import org.red5.server.api.IApplicationContext;
import org.red5.server.api.IApplicationLoader;
import org.springframework.context.ApplicationContext;

// TODO: Auto-generated Javadoc
/**
 * Base class for all J2EE application loaders.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public class LoaderBase {

	/** We store the application context in a ThreadLocal so we can access it later. */
	protected static ThreadLocal<ApplicationContext> applicationContext = new ThreadLocal<ApplicationContext>();

	/** Current Red5 application context, set by the different loaders. */
	public static Map<String, IApplicationContext> red5AppCtx = new HashMap<String, IApplicationContext>();
	
	/** Loader for new applications. */
	protected static ThreadLocal<IApplicationLoader> loader = new ThreadLocal<IApplicationLoader>();

	/** Folder containing the webapps. */
	protected String webappFolder = null;

	/**
	 * Getter for the application loader.
	 * 
	 * @return Application loader
	 */ 
	public static IApplicationLoader getApplicationLoader() {
		return loader.get();
	}
	
	/**
	 * Setter for the application loader.
	 * 
	 * @param loader Application loader
	 */
	public static void setApplicationLoader(IApplicationLoader loader) {
		LoaderBase.loader.set(loader);
	}
	
	/**
	 * Getter for the Red5 application context.
	 * 
	 * @param path the path
	 * 
	 * @return Red5 application context
	 */
	public static IApplicationContext getRed5ApplicationContext(String path) {
		return red5AppCtx.get(path);
	}
	
	/**
	 * Setter for the Red5 application context.
	 * 
	 * @param context Red5 application context
	 * @param path the path
	 */
	public static void setRed5ApplicationContext(String path, IApplicationContext context) {
		if (context != null) {
			red5AppCtx.put(path, context);
		} else {
			red5AppCtx.remove(path);
		}
	}
	
	/**
	 * Getter for application context.
	 * 
	 * @return         Application context
	 */
	public static ApplicationContext getApplicationContext() {
		return applicationContext.get();
	}
	
	/**
	 * Set the folder containing webapps.
	 * 
	 * @param webappFolder the webapp folder
	 */
	public void setWebappFolder(String webappFolder) {
		File fp = new File(webappFolder);
		if (!fp.isDirectory()) {
			throw new RuntimeException("Webapp folder " + webappFolder + " doesn't exist.");
		}
		this.webappFolder = webappFolder;
	}

}
