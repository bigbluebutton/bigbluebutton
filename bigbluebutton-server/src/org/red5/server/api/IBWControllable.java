package org.red5.server.api;

// TODO: Auto-generated Javadoc
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

/**
 * Mark an object that can be bandwidth controlled.
 * <p>
 * A bw-controlled object has the bandwidth config property and a link to the
 * parent controllable object.
 * </p>
 * <p>
 * The parent controllable object acts as the bandwidth provider
 * for this object, thus generates a tree structure, in which
 * the <tt>null</tt> parent means the host. The next depth level
 * is the <tt>IClient</tt>. The following is
 * <tt>IStreamCapableConnection</tt>. The deepest level is
 * <tt>IClientStream</tt>. That is, bandwidth can be separately configured for
 * client stream or connection, or client or the whole application.
 * </p>
 * <p>
 * The summary of children's bandwidth can't exceed the parent's bandwidth
 * even though the children's bandwidth could be configured larger than the
 * parent's bandwidth.
 * </p>
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Steven Gong (steven.gong@gmail.com)
 */
public interface IBWControllable {
	
	/**
	 * Return parent IFlowControllable object.
	 * 
	 * @return parent     Parent flow controllable
	 */
	IBWControllable getParentBWControllable();

	/**
	 * Return bandwidth configuration object. Bandwidth configuration
	 * allows you to set bandwidth size for audio, video and total amount.
	 * 
	 * @return Bandwidth configuration object
	 */
	IBandwidthConfigure getBandwidthConfigure();

	/**
	 * Setter for bandwidth configuration.
	 * 
	 * @param config Value to set for bandwidth configuration
	 */
    void setBandwidthConfigure(IBandwidthConfigure config);
}
