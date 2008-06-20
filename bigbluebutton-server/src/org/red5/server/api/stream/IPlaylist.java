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
 * Playlist.
 */
public interface IPlaylist {
	
	/**
	 * Add an item to the list.
	 * 
	 * @param item       Playlist item
	 */
	void addItem(IPlayItem item);

	/**
	 * Add an item to specific index.
	 * 
	 * @param item       Playlist item
	 * @param index      Index in list
	 */
	void addItem(IPlayItem item, int index);

	/**
	 * Remove an item from list.
	 * 
	 * @param index      Index in list
	 */
	void removeItem(int index);

	/**
	 * Remove all items.
	 */
	void removeAllItems();

	/**
	 * Return number of items in list.
	 * 
	 * @return  Number of items in list
	 */
    int getItemSize();

	/**
	 * Get currently playing item index.
	 * 
	 * @return       Currently playing item index.
	 */
	int getCurrentItemIndex();

    /**
     * Get currently playing item.
     * 
     * @return       Item
     */
    IPlayItem getCurrentItem();

    /**
     * Get the item according to the index.
     * 
     * @param index  Item index
     * 
     * @return       Item at that index in list
     */
	IPlayItem getItem(int index);

	/**
	 * Check if the playlist has more items after the currently
	 * playing one.
	 * 
	 * @return <code>true</code> if more items are available, <code>false</code> otherwise
	 */
	boolean hasMoreItems();
	
	/**
	 * Go for the previous played item.
	 */
	void previousItem();

	/**
	 * Go for next item decided by controller logic.
	 */
	void nextItem();

	/**
	 * Set the current item for playing.
	 * 
	 * @param index    Position in list
	 */
	void setItem(int index);

	/**
	 * Whether items are randomly played.
	 * 
	 * @return         <code>true</code> if shuffle is on for this list, <code>false</code> otherwise
	 */
	boolean isRandom();

	/**
	 * Set whether items should be randomly played.
	 * 
	 * @param random   Shuffle flag
	 */
	void setRandom(boolean random);

	/**
	 * Whether rewind the list.
	 * 
	 * @return         <code>true</code> if playlist is rewind on end, <code>false</code> otherwise
	 */
	boolean isRewind();

	/**
	 * Set whether rewind the list.
	 * 
	 * @param rewind   New vallue for rewind flag
	 */
	void setRewind(boolean rewind);

	/**
	 * Whether repeat playing an item.
	 * 
	 * @return        <code>true</code> if repeat mode is on for this playlist, <code>false</code> otherwise
	 */
	boolean isRepeat();

	/**
	 * Set whether repeat playing an item.
	 * 
	 * @param repeat  New value for item playback repeat flag
	 */
	void setRepeat(boolean repeat);

	/**
	 * Set list controller.
	 * 
	 * @param controller      Playlist controller
	 */
	void setPlaylistController(IPlaylistController controller);
}
