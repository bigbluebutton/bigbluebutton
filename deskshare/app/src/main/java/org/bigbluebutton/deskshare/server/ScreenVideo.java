/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Affero General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Richard Alam <ritzalam@gmail.com>
 *
 * $Id: $x
 */
package org.bigbluebutton.deskshare.server;

import org.apache.mina.core.buffer.IoBuffer;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.stream.IVideoStreamCodec;
import org.slf4j.Logger;

public class ScreenVideo implements IVideoStreamCodec {

	private Logger log = Red5LoggerFactory.getLogger(ScreenVideo.class, "deskshare");
	static final String CODEC_NAME = "ScreenVideo";
	static final byte FLV_FRAME_KEY = 0x10;
	static final byte FLV_CODEC_SCREEN = 0x03;
	private IoBuffer data;
	
    public ScreenVideo() {
		this.reset();
	}

    public String getName() {
		return CODEC_NAME;
	}

    public void reset() {
    	
	}

    public boolean canHandleData(IoBuffer data) {
		byte first = data.get();
		boolean result = ((first & 0x0f) == FLV_CODEC_SCREEN);
		data.rewind();
		return result;
	}

    public boolean canDropFrames() {
    	/*
    	 * MUST be false. Otherwise, Red5 starts dropping frames if
    	 * the framerate is not fast enough.
    	 */
		return false;
	}

    public boolean addData(IoBuffer data) {
		if (!this.canHandleData(data)) {
			log.warn("Cannot handle data");
			return false;
		}
		this.data = data;
		
//		log.debug("Adding data " + data.remaining());
		
		this.data.rewind();
		return true;
	}

    public IoBuffer getKeyframe() {
    	log.debug("getting keyFrame");
		return data;
	}

    public IoBuffer getDecoderConfiguration() {
    	log.debug("getting DecoderConfiguration");
		return data;
    }
}

