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

import org.red5.server.api.IMappingStrategy;

// TODO: Auto-generated Javadoc
/**
 * Basic mapping strategy implementation. This one uses slash as filesystem path separator,
 * '.service' postfix for services naming, '.handler' for handlers naming and 'default' string as
 * default application name.
 */
public class MappingStrategy implements IMappingStrategy {
    
    /** Root constant. */
	private static final String ROOT = "";
    
    /** Handler extension constant. */
	private static final String HANDLER = ".handler";
    
    /** Dir separator constant. */
	private static final String DIR = "/";
    
    /** Service extension constant. */
	private static final String SERVICE = ".service";
    
    /** Default application name. */
	private String defaultApp = "default";

    /**
     * Setter for default application name ('default' by default).
     * 
     * @param defaultApp     Default application
     */
	public void setDefaultApp(String defaultApp) {
		this.defaultApp = defaultApp;
	}

    /**
     * Resolves resource prefix from path. Default application used as root when path is specified
     * 
     * @param path          Path
     * 
     * @return              Resource prefix according to this naming strategy
     */
	public String mapResourcePrefix(String path) {
		if (path == null || path.equals(ROOT)) {
			return defaultApp + DIR;
		} else {
			return path + DIR;
		}
	}

    /**
     * Resolves scope handler name for path& Default application used as root when path is specified.
     * 
     * @param path         Path
     * 
     * @return             Scope handler name according to this naming strategy
     */
	public String mapScopeHandlerName(String path) {
		if (path == null || path.equals(ROOT)) {
			return defaultApp + HANDLER;
		} else {
			return path + HANDLER;
		}
	}

    /**
     * Resolves service filename name from name.
     * 
     * @param name      Service name
     * 
     * @return          Service filename according to this naming strategy
     */
	public String mapServiceName(String name) {
		return name + SERVICE;
	}

}
