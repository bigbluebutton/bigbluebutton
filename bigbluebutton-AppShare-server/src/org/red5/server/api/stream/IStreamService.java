package org.red5.server.api.stream;

import org.red5.server.api.IScopeService;

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
 * This interface represents the stream methods that can be called throug RTMP.
 */
public interface IStreamService extends IScopeService {

	/** The BEA n_ name. */
	public static String BEAN_NAME = "streamService";

	/**
	 * Create a stream and return a corresponding id.
	 * 
	 * @return     ID of created stream
	 */
	public int createStream();

	/**
	 * Close the stream but not deallocate the resources.
	 */
	public void closeStream();

	/**
	 * Close the stream if not been closed.
	 * Deallocate the related resources.
	 * 
	 * @param streamId          Stram id
	 */
	public void deleteStream(int streamId);

	/**
	 * Called by FME.
	 * 
	 * @param streamName the stream name
	 */
	public void releaseStream(String streamName);

    /**
     * Delete stream.
     * 
     * @param conn            Stream capable connection
     * @param streamId        Stream id
     */
    public void deleteStream(IStreamCapableConnection conn, int streamId);

    /**
     * Play stream without initial stop.
     * 
     * @param dontStop         Stoppage flag
     */
	public void play(Boolean dontStop);

    /**
     * Play stream with name.
     * 
     * @param name          Stream name
     */
	public void play(String name);

    /**
     * Play stream with name from start position.
     * 
     * @param name          Stream name
     * @param start         Start position
     */
	public void play(String name, int start);

    /**
     * Play stream with name from start position and for given amount if time.
     * 
     * @param name          Stream name
     * @param start         Start position
     * @param length        Playback length
     */
	public void play(String name, int start, int length);

    /**
     * Publishes stream from given position for given amount of time.
     * 
     * @param name                      Stream published name
     * @param start                     Start position
     * @param length                    Playback length
     * @param flushPlaylist             Flush playlist?
     */
	public void play(String name, int start, int length, boolean flushPlaylist);

    /**
     * Publishes stream with given name.
     * 
     * @param name             Stream published name
     */
	public void publish(String name);

    /**
     * Publishes stream with given name and mode.
     * 
     * @param name            Stream published name
     * @param mode            Stream publishing mode
     */
	public void publish(String name, String mode);

    /**
     * Publish.
     * 
     * @param dontStop      Whether need to stop first
     */
	public void publish(Boolean dontStop);

    /**
     * Seek to position.
     * 
     * @param position         Seek position
     */
	public void seek(int position);

    /**
     * Pauses playback.
     * 
     * @param pausePlayback           Pause flah
     * @param position                Pause position
     */
	public void pause(boolean pausePlayback, int position);

    /**
     * Can recieve video?.
     * 
     * @param receive       Boolean flag
     */
	public void receiveVideo(boolean receive);

    /**
     * Can recieve audio?.
     * 
     * @param receive       Boolean flag
     */
	public void receiveAudio(boolean receive);

}
