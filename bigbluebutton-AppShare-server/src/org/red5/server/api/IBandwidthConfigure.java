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
 * Interface for setting/getting bandwidth configure.
 * 
 * Two properties are provided for bandwidth configuration. The property
 * "channelBandwidth" is used to configure the bandwidth of each channel.
 * The property "channelInitialBurst" is used to configure the initial
 * bytes that can be sent to client in each channel.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Steven Gong (steven.gong@gmail.com)
 */
public interface IBandwidthConfigure extends Cloneable {
	
	/** The Constant AUDIO_CHANNEL. */
	public static final int AUDIO_CHANNEL = 0;
	
	/** The Constant VIDEO_CHANNEL. */
	public static final int VIDEO_CHANNEL = 1;
	
	/** The Constant DATA_CHANNEL. */
	public static final int DATA_CHANNEL = 2;
	
	/** The Constant OVERALL_CHANNEL. */
	public static final int OVERALL_CHANNEL = 3;
	
	/** The Constant MAX_CHANNEL_CONFIG_COUNT. */
	public static final int MAX_CHANNEL_CONFIG_COUNT = 4;
	
	/**
	 * Return the bandwidth configure for 3 channels: audio, video, data and
	 * the overall bandwidth.
	 * The unit is bit per second. A value of <tt>-1</tt> means "don't care"
	 * so that there's no limit on bandwidth for that channel.
	 * The last element is the overall bandwidth. If it's not <tt>-1</tt>,
	 * the value of the first three elements will be ignored.
	 * 
	 * @return The 4-element array of bandwidth configure.
	 */
	long[] getChannelBandwidth();
	
	/**
	 * Return the byte count of initial burst value for 3 channels: audio,
	 * video, data and the overall bandwidth.
	 * If the value is <tt>-1</tt>, the default will be used per the implementation
	 * of bandwidth controller.
	 * 
	 * @return The 4-element array of byte count of initial burst value.
	 */
	long[] getChannelInitialBurst();
}
