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

import org.red5.server.api.IScopeHandler;

// TODO: Auto-generated Javadoc
/**
 * A scope handler that is stream aware.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Steven Gong (steven.gong@gmail.com)
 */
public interface IStreamAwareScopeHandler extends IScopeHandler {
	
	/**
	 * A broadcast stream starts being published. This will be called
	 * when the first video packet has been received.
	 * 
	 * @param stream the stream
	 */
	public void streamPublishStart(IBroadcastStream stream);

	/**
	 * A broadcast stream starts being recorded. This will be called
	 * when the first video packet has been received.
	 * 
	 * @param stream the stream
	 */
	public void streamRecordStart(IBroadcastStream stream);

	/**
	 * Notified when a broadcaster starts.
	 * 
	 * @param stream the stream
	 */
	public void streamBroadcastStart(IBroadcastStream stream);

	/**
	 * Notified when a broadcaster closes.
	 * 
	 * @param stream the stream
	 */
	public void streamBroadcastClose(IBroadcastStream stream);

	/**
	 * Notified when a subscriber starts.
	 * 
	 * @param stream the stream
	 */
	public void streamSubscriberStart(ISubscriberStream stream);

	/**
	 * Notified when a subscriber closes.
	 * 
	 * @param stream the stream
	 */
	public void streamSubscriberClose(ISubscriberStream stream);

	/**
	 * Notified when a playlist item plays.
	 * 
	 * @param stream the stream
	 * @param item the item
	 * @param isLive TODO
	 */
	public void streamPlaylistItemPlay(IPlaylistSubscriberStream stream,
			IPlayItem item, boolean isLive);

	/**
	 * Notified when a playlist item stops.
	 * 
	 * @param stream the stream
	 * @param item the item
	 */
	public void streamPlaylistItemStop(IPlaylistSubscriberStream stream,
			IPlayItem item);

	/**
	 * Notified when a playlist vod item pauses.
	 * 
	 * @param stream the stream
	 * @param item the item
	 * @param position the position
	 */
	public void streamPlaylistVODItemPause(IPlaylistSubscriberStream stream,
			IPlayItem item, int position);

	/**
	 * Notified when a playlist vod item resumes.
	 * 
	 * @param stream the stream
	 * @param item the item
	 * @param position the position
	 */
	public void streamPlaylistVODItemResume(IPlaylistSubscriberStream stream,
			IPlayItem item, int position);

	/**
	 * Notified when a playlist vod item seeks.
	 * 
	 * @param stream the stream
	 * @param item the item
	 * @param position the position
	 */
	public void streamPlaylistVODItemSeek(IPlaylistSubscriberStream stream,
			IPlayItem item, int position);
}
