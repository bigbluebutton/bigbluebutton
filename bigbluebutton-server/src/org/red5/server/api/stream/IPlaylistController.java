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
 * A play list controller that controls the order of play items.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Steven Gong (steven.gong@gmail.com)
 */
public interface IPlaylistController {
	
	/**
	 * Get next item to play.
	 * 
	 * @param playlist The related play list.
	 * @param itemIndex The current item index. <tt>-1</tt> indicates to retrieve
	 * the first item for play.
	 * 
	 * @return The next item index to play. <tt>-1</tt> reaches the end.
	 */
	int nextItem(IPlaylist playlist, int itemIndex);

	/**
	 * Get previous item to play.
	 * 
	 * @param playlist The related play list.
	 * @param itemIndex The current item index. <tt>IPlaylist.itemSize</tt>
	 * indicated to retrieve the last item for play.
	 * 
	 * @return The previous item index to play. <tt>-1</tt> reaches the
	 * beginning.
	 */
	int previousItem(IPlaylist playlist, int itemIndex);
}
