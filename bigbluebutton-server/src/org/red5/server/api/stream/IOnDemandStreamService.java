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

import org.red5.server.api.IScope;
import org.red5.server.api.IScopeService;

// TODO: Auto-generated Javadoc
/**
 * The Interface IOnDemandStreamService.
 */
public interface IOnDemandStreamService extends IScopeService {

	/** The BEA n_ name. */
	public static String BEAN_NAME = "onDemandStreamService";

	/**
	 * Has the service an on-demand stream with the passed name?.
	 * 
	 * @param scope the scope to check for the stream
	 * @param name the name of the stream
	 * 
	 * @return true if the stream exists, false otherwise
	 */
	public boolean hasOnDemandStream(IScope scope, String name);

	/**
	 * Get a stream that can be used for playback of the on-demand stream.
	 * 
	 * @param scope the scope to return the stream from
	 * @param name the name of the stream
	 * 
	 * @return the on-demand stream
	 */
	public IOnDemandStream getOnDemandStream(IScope scope, String name);

}
