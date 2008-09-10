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

import org.red5.server.net.rtmp.Channel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Output stream that consists of audio, video and data channels.
 * 
 * @see org.red5.server.net.rtmp.Channel
 */
public class OutputStream {
    
    /** Logger. */
	protected static Logger log = LoggerFactory.getLogger(OutputStream.class);
    
    /** Video channel. */
	private Channel video;
    
    /** Audio channel. */
	private Channel audio;
    
    /** Data channel. */
	private Channel data;

    /**
     * Creates output stream from channels.
     * 
     * @param video        Video channel
     * @param audio        Audio channel
     * @param data         Data channel
     */
    public OutputStream(Channel video, Channel audio, Channel data) {
		this.video = video;
		this.audio = audio;
		this.data = data;
	}

    /**
     * Closes audion, video and data channels.
     */
    public void close() {
		this.video.close();
		this.audio.close();
		this.data.close();
	}

	/**
	 * Getter for audio channel.
	 * 
	 * @return  Audio channel
	 */
    public Channel getAudio() {
		return audio;
	}

	/**
	 * Getter for data channel.
	 * 
	 * @return   Data channel
	 */
    public Channel getData() {
		return data;
	}

	/**
	 * Getter for video channel.
	 * 
	 * @return Video channel
	 */
    public Channel getVideo() {
		return video;
	}
}
