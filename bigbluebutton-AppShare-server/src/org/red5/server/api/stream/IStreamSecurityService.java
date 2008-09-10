package org.red5.server.api.stream;

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

import java.util.Set;

import org.red5.server.api.IScopeService;

// TODO: Auto-generated Javadoc
/**
 * Service that supports protecting access to streams.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public interface IStreamSecurityService extends IScopeService {

	/** Name of a bean defining that scope service. */
	public static final String BEAN_NAME = "streamSecurityService";

	/**
	 * Add handler that protects stream publishing.
	 * 
	 * @param handler Handler to add.
	 */
	public void registerStreamPublishSecurity(IStreamPublishSecurity handler);
	
	/**
	 * Remove handler that protects stream publishing.
	 * 
	 * @param handler Handler to remove.
	 */
	public void unregisterStreamPublishSecurity(IStreamPublishSecurity handler);
	
	/**
	 * Get handlers that protect stream publishing.
	 * 
	 * @return list of handlers
	 */
	public Set<IStreamPublishSecurity> getStreamPublishSecurity();
	
	/**
	 * Add handler that protects stream playback.
	 * 
	 * @param handler Handler to add.
	 */
	public void registerStreamPlaybackSecurity(IStreamPlaybackSecurity handler);
	
	/**
	 * Remove handler that protects stream playback.
	 * 
	 * @param handler Handler to remove.
	 */
	public void unregisterStreamPlaybackSecurity(IStreamPlaybackSecurity handler);
	
	/**
	 * Get handlers that protect stream plaback.
	 * 
	 * @return list of handlers
	 */
	public Set<IStreamPlaybackSecurity> getStreamPlaybackSecurity();
	
}
