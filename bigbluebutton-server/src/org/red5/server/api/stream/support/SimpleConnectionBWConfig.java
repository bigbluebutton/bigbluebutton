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

import org.red5.server.api.IBandwidthConfigure;
import org.red5.server.api.IConnectionBWConfig;

// TODO: Auto-generated Javadoc
/**
 * Simple implementation of connection bandwidth configuration.
 * 
 * @author Steven Gong (steven.gong@gmail.com)
 * @version $Id$
 */
public class SimpleConnectionBWConfig extends SimpleBandwidthConfigure
		implements IConnectionBWConfig {
	
	/** The upstream bw. */
	private long upstreamBW;

	/* (non-Javadoc)
	 * @see org.red5.server.api.IConnectionBWConfig#getDownstreamBandwidth()
	 */
	public long getDownstreamBandwidth() {
		long[] channelBandwidth = getChannelBandwidth();
		if (channelBandwidth[IBandwidthConfigure.OVERALL_CHANNEL] >= 0) {
			return channelBandwidth[IBandwidthConfigure.OVERALL_CHANNEL];
		} else {
			long bw = 0;
			if (channelBandwidth[IBandwidthConfigure.AUDIO_CHANNEL] < 0 || channelBandwidth[IBandwidthConfigure.VIDEO_CHANNEL] < 0) {
				bw = -1;
			} else {
				bw = channelBandwidth[IBandwidthConfigure.AUDIO_CHANNEL] + channelBandwidth[IBandwidthConfigure.VIDEO_CHANNEL];
			}
			if (channelBandwidth[IBandwidthConfigure.DATA_CHANNEL] >= 0) {
				bw += channelBandwidth[IBandwidthConfigure.DATA_CHANNEL];
			}
			return bw;
		}
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.IConnectionBWConfig#getUpstreamBandwidth()
	 */
	public long getUpstreamBandwidth() {
		return upstreamBW;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.IConnectionBWConfig#setUpstreamBandwidth(long)
	 */
	public void setUpstreamBandwidth(long bw) {
		upstreamBW = bw;
	}

}
