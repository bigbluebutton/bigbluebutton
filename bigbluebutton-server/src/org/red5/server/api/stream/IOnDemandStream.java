package org.red5.server.api.stream;

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
 * Extends stream to add methods for on demand access.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Luke Hubbard (luke@codegent.com)
 */
public interface IOnDemandStream extends IStream {

	/**
	 * Start playback.
	 */
	public void play();

	/**
	 * Start playback with a given maximum duration.
	 * 
	 * @param length maximum duration in milliseconds
	 */
	public void play(int length);

	/**
	 * Seek to the keyframe nearest to position.
	 * 
	 * @param position position in milliseconds
	 */
	public void seek(int position);

	/**
	 * Pause the stream.
	 */
	public void pause();

	/**
	 * Resume a paused stream.
	 */
	public void resume();

	/**
	 * Stop the stream, this resets the position to the start.
	 */
	public void stop();

	/**
	 * Is the stream paused.
	 * 
	 * @return true if the stream is paused
	 */
	public boolean isPaused();

	/**
	 * Is the stream stopped.
	 * 
	 * @return true if the stream is stopped
	 */
	public boolean isStopped();

	/**
	 * Is the stream playing.
	 * 
	 * @return true if the stream is playing
	 */
	public boolean isPlaying();

}