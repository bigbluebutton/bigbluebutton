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
 
import java.io.Serializable;

// TODO: Auto-generated Javadoc
/**
 * The Class WebSettings.
 */
public class WebSettings implements Serializable {

	/** The path. */
	private String path;

	/** The configs. */
	private String[] configs;

	/** The web app key. */
	private String webAppKey;

	/**
	 * Gets the path.
	 * 
	 * @return the path
	 */
	public String getPath() {
		return path;
	}

	/**
	 * Sets the path.
	 * 
	 * @param path the new path
	 */
	public void setPath(String path) {
		this.path = path;
	}

	/**
	 * Gets the configs.
	 * 
	 * @return the configs
	 */
	public String[] getConfigs() {
		return configs;
	}

	/**
	 * Sets the configs.
	 * 
	 * @param configs the new configs
	 */
	public void setConfigs(String[] configs) {
		this.configs = configs;
	}

	/**
	 * Gets the web app key.
	 * 
	 * @return the web app key
	 */
	public String getWebAppKey() {
		return webAppKey;
	}

	/**
	 * Sets the web app key.
	 * 
	 * @param webAppKey the new web app key
	 */
	public void setWebAppKey(String webAppKey) {
		this.webAppKey = webAppKey;
	}

}