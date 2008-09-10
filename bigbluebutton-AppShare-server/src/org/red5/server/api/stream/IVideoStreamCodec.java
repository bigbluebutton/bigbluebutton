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

import org.apache.mina.common.ByteBuffer;

// TODO: Auto-generated Javadoc
/**
 * The Interface IVideoStreamCodec.
 */
public interface IVideoStreamCodec {

	/**
	 * Return the name of the video codec.
	 * 
	 * @return the name
	 */
	public String getName();

	/**
	 * Reset the codec to its initial state.
	 */
	public void reset();

	/**
	 * Check if the codec supports frame dropping.
	 * 
	 * @return true, if can drop frames
	 */
	public boolean canDropFrames();

	/**
	 * Returns true if the codec knows how to handle the passed
	 * stream data.
	 * 
	 * @param data the data
	 * 
	 * @return true, if can handle data
	 */
	public boolean canHandleData(ByteBuffer data);

	/**
	 * Update the state of the codec with the passed data.
	 * 
	 * @param data the data
	 * 
	 * @return true, if adds the data
	 */
	public boolean addData(ByteBuffer data);

	/**
	 * Return the data for a keyframe.
	 * 
	 * @return the keyframe
	 */
	public ByteBuffer getKeyframe();
}
