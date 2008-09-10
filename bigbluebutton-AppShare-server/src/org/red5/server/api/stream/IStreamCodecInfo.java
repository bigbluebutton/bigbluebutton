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
 * Stream codec information.
 */
public interface IStreamCodecInfo {
    
    /**
     * Has audio support?.
     * 
     * @return           <code>true</code> if stream codec has audio support, <code>false</code> otherwise
     */
    boolean hasAudio();

    /**
     * Has video support?.
     * 
     * @return           <code>true</code> if stream codec has video support, <code>false</code> otherwise
     */
	boolean hasVideo();

	/**
	 * Getter for audio codec name.
	 * 
	 * @return Audio codec name
	 */
    String getAudioCodecName();

	/**
	 * Getter for video codec name.
	 * 
	 * @return Video codec name
	 */
    String getVideoCodecName();

	/**
	 * Return video codec.
	 * 
	 * @return Video codec used by stream codec
	 */
    IVideoStreamCodec getVideoCodec();
}
