package org.red5.io;

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
import java.util.HashSet;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Creates streamable file services.
 */
public class StreamableFileFactory implements IStreamableFileFactory {

	// Initialize Logging
	/** The logger. */
	public static Logger logger = LoggerFactory
			.getLogger(StreamableFileFactory.class);

	/** The services. */
	private Set<IStreamableFileService> services = new HashSet<IStreamableFileService>();

	/**
	 * Setter for services.
	 * 
	 * @param services Set of streamable file services
	 */
	public void setServices(Set<IStreamableFileService> services) {
		logger.debug("StreamableFileFactory set services");
		this.services = services;
	}

	/** {@inheritDoc} */
	public IStreamableFileService getService(File fp) {
		logger.debug("Get service for file: " + fp.getName());
		// Return first service that can handle the passed file
		for (IStreamableFileService service : this.services) {
			if (service.canHandle(fp)) {
				logger.debug("Found service");
				return service;
			}
		}
		return null;
	}

	/** {@inheritDoc} */
	public Set<IStreamableFileService> getServices() {
		logger.debug("StreamableFileFactory get services");
		return services;
	}
}
