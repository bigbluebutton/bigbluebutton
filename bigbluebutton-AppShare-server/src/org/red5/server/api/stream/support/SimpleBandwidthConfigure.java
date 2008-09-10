package org.red5.server.api.stream.support;

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

import java.util.Arrays;

import org.red5.server.api.IBandwidthConfigure;
import org.red5.server.api.IConnectionBWConfig;

// TODO: Auto-generated Javadoc
/**
 * This class is the only IBandwidthConfigure implementation provided in 0.6. It's a kind
 * of ValueObject (item with a set of values that just stores data) that is used
 * to configure Red5 application bandwidth settings.
 * 
 * Note: To configure the connection's bandwidth, you should use the
 * implementation of {@link IConnectionBWConfig} instead.
 * 
 * @see IConnectionBWConfig
 * @see SimpleConnectionBWConfig
 */
public class SimpleBandwidthConfigure implements IBandwidthConfigure {
	
	/** The channel bandwidth. */
	private long[] channelBandwidth;
	
	/** The channel initial burst. */
	private long[] channelInitialBurst;
	
	/**
	 * Instantiates a new simple bandwidth configure.
	 */
	public SimpleBandwidthConfigure() {
		channelBandwidth = new long[4];
		Arrays.fill(channelBandwidth, -1);
		channelInitialBurst = new long[4];
		Arrays.fill(channelInitialBurst, -1);
	}
	
	/**
	 * Instantiates a new simple bandwidth configure.
	 * 
	 * @param config the config
	 */
	public SimpleBandwidthConfigure(IBandwidthConfigure config) {
		channelBandwidth = new long[4];
		channelInitialBurst = new long[4];
		for (int i = 0; i < 4; i++) {
			channelBandwidth[i] = config.getChannelBandwidth()[i];
			channelInitialBurst[i] = config.getChannelInitialBurst()[i];
		}
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.IBandwidthConfigure#getChannelBandwidth()
	 */
	public long[] getChannelBandwidth() {
		return channelBandwidth;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.IBandwidthConfigure#getChannelInitialBurst()
	 */
	public long[] getChannelInitialBurst() {
		return channelInitialBurst;
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#clone()
	 */
	@Override
	protected Object clone() throws CloneNotSupportedException {
		SimpleBandwidthConfigure cloned = new SimpleBandwidthConfigure();
		cloned.channelBandwidth = new long[4];
		cloned.channelInitialBurst = new long[4];
		for (int i = 0; i < 4; i++) {
			cloned.channelBandwidth[i] = this.channelBandwidth[i];
			cloned.channelInitialBurst[i] = this.channelInitialBurst[i];
		}
		return cloned;
	}
}
