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

import java.util.ArrayList;
import java.util.List;

import org.apache.mina.common.ByteBuffer;
import org.red5.server.api.stream.IVideoStreamCodec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Factory for video codecs. Creates and returns video codecs
 */
public class VideoCodecFactory {
    
    /** Object key. */
	public static final String KEY = "videoCodecFactory";
    
    /** Logger for video factory. */
	private Logger log = LoggerFactory.getLogger(VideoCodecFactory.class);
    
    /** List of available codecs. */
	private List<IVideoStreamCodec> codecs = new ArrayList<IVideoStreamCodec>();

	/**
	 * Setter for codecs.
	 * 
	 * @param codecs List of codecs
	 */
    public void setCodecs(List<IVideoStreamCodec> codecs) {
		this.codecs = codecs;
	}

    /**
     * Create and return new video codec applicable for byte buffer data.
     * 
     * @param data                 Byte buffer data
     * 
     * @return                     Video codec
     */
	public IVideoStreamCodec getVideoCodec(ByteBuffer data) {
		IVideoStreamCodec result = null;
		for (IVideoStreamCodec storedCodec: codecs) {
			IVideoStreamCodec codec;
			// XXX: this is a bit of a hack to create new instances of the
			// configured
			//      video codec for each stream
			try {
				codec = storedCodec.getClass().newInstance();
			} catch (Exception e) {
				log.error("Could not create video codec instance.", e);
				continue;
			}

			log.info("Trying codec " + codec);
			if (codec.canHandleData(data)) {
				result = codec;
				break;
			}
		}

		// No codec for this video data
		return result;
	}
}
