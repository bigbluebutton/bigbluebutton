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

import java.util.Random;

import org.red5.server.api.stream.IPlaylist;
import org.red5.server.api.stream.IPlaylistController;

// TODO: Auto-generated Javadoc
/**
 * Simple playlist controller implementation.
 */
public class SimplePlaylistController implements IPlaylistController {
	
	/** {@inheritDoc} */
    public int nextItem(IPlaylist playlist, int itemIndex) {
		if (itemIndex < 0) {
			itemIndex = -1;
		}
		
		if (playlist.isRepeat()) {
			return itemIndex;
		}
		
		if (playlist.isRandom()) {
			int lastIndex = itemIndex;
			if (playlist.getItemSize() > 1) {
				// continuously generate a random number
				// until you get one that was not the last...
				Random rand = new Random();
				while (itemIndex == lastIndex) {
					itemIndex = rand.nextInt(playlist.getItemSize());
				}
			}
			return itemIndex;
		}
		
		int nextIndex = itemIndex + 1;
		
		if (nextIndex < playlist.getItemSize()) {
			return nextIndex;
		} else if (playlist.isRewind()) {
			return playlist.getItemSize() > 0 ? 0 : -1;
		} else {
			return -1;
		}
	}

	/** {@inheritDoc} */
    public int previousItem(IPlaylist playlist, int itemIndex) {
    	
		if (itemIndex > playlist.getItemSize()) {
			return playlist.getItemSize() - 1;
		}
		
		if (playlist.isRepeat()) {
			return itemIndex;
		}

		if (playlist.isRandom()) {
			Random rand = new Random();
			int lastIndex = itemIndex;
			// continuously generate a random number
			// until you get one that was not the last...
			while (itemIndex == lastIndex) {
				itemIndex = rand.nextInt(playlist.getItemSize());
			}
			lastIndex = itemIndex;
			return itemIndex;
		}
		
		int prevIndex = itemIndex - 1;
		
		if (prevIndex >= 0) {
			return prevIndex;
		} else if (playlist.isRewind()) {
			return playlist.getItemSize() - 1;
		} else {
			return -1;
		}
	}

}