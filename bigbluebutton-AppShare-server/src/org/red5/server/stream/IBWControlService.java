package org.red5.server.stream;

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

import org.red5.server.api.IBWControllable;

// TODO: Auto-generated Javadoc
/**
 * Bandwidth controller service interface.
 * <p>
 * The bandwidth controllable is registered in the bandwidth
 * controller which provides the three token buckets used for
 * bandwidth control.
 * <p>
 * The bandwidth controller manages the token buckets assigned
 * to the bandwidth controllable and distributes the tokens
 * to the buckets in an implementation-specific way. (eg timely
 * distribute the tokens according to the bandwidth config of
 * the controllable)
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Steven Gong (steven.gong@gmail.com)
 */
public interface IBWControlService {
	
	/** The Constant KEY. */
	public static final String KEY = "BWControlService";

	/**
	 * Register a bandwidth controllable. The necessary resources
	 * will be allocated and assigned to the controllable.
	 * 
	 * @param bc The bandwidth controllable.
	 * 
	 * @return The registry context. It's used in the subsequent
	 * calls to controller's method.
	 */
	IBWControlContext registerBWControllable(IBWControllable bc);
	
	/**
	 * Unregister the bandwidth controllable. The resources that were
	 * allocated will be freed.
	 * 
	 * @param context The registry context.
	 */
	void unregisterBWControllable(IBWControlContext context);
	
	/**
	 * Lookup the registry context according to the controllable.
	 * 
	 * @param bc The bandwidth controllable.
	 * 
	 * @return The registry context.
	 */
	IBWControlContext lookupContext(IBWControllable bc);
	
	/**
	 * Update the bandwidth configuration of a controllable.
	 * Each time when the controllable changes the bandwidth config
	 * and wants to make the changes take effect, this method should
	 * be called.
	 * 
	 * @param context The registry context.
	 */
	void updateBWConfigure(IBWControlContext context);
	
	/**
	 * Reset all the token buckets for a controllable. All the callback
	 * will be reset and all blocked threads will be woken up.
	 * 
	 * @param context The registry context.
	 */
	void resetBuckets(IBWControlContext context);
	
	/**
	 * Return the token bucket for audio channel.
	 * 
	 * @param context The registry context.
	 * 
	 * @return Token bucket for audio channel.
	 */
	ITokenBucket getAudioBucket(IBWControlContext context);
	
	/**
	 * Return the token bucket for video channel.
	 * 
	 * @param context The registry context.
	 * 
	 * @return Token bucket for video channel.
	 */
	ITokenBucket getVideoBucket(IBWControlContext context);
	
	/**
	 * Return the token bucket for data channel.
	 * 
	 * @param context The registry context.
	 * 
	 * @return Token bucket for data channel.
	 */
	ITokenBucket getDataBucket(IBWControlContext context);
}
