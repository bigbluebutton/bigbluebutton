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

import org.red5.server.api.IScope;

// TODO: Auto-generated Javadoc
/**
 * Interface for handlers that control access to stream playback.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public interface IStreamPlaybackSecurity {

	/**
	 * Check if playback of a stream with the given name is allowed.
	 * 
	 * @param scope Scope the stream is about to be played back from.
	 * @param name Name of the stream to play.
	 * @param start Position to start playback from (in milliseconds).
	 * @param length Duration to play (in milliseconds).
	 * @param flushPlaylist Flush playlist?
	 * 
	 * @return <code>True</code> if playback is allowed, otherwise <code>False</code>
	 */
	public boolean isPlaybackAllowed(IScope scope, String name, int start, int length, boolean flushPlaylist);
	
}
