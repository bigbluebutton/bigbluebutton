/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.deskshare.server;

import org.apache.mina.core.buffer.IoBuffer;
import org.red5.logging.Red5LoggerFactory;
import org.red5.codec.IVideoStreamCodec;
import org.slf4j.Logger;

public class ScreenVideo implements IVideoStreamCodec {

	private Logger log = Red5LoggerFactory.getLogger(ScreenVideo.class, "deskshare");
	static final String CODEC_NAME = "ScreenVideo";
	static final byte FLV_FRAME_KEY = 0x10;
	static final byte FLV_CODEC_SCREEN = 0x03;
	static final byte FLV_CODEC_SCREEN_V2 = 0x06;
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
		int first = data.get() & 0x0f;
		boolean result = (first == FLV_CODEC_SCREEN || first == FLV_CODEC_SCREEN_V2);
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

	@Override
	public FrameData getInterframe(int arg0) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public int getNumInterframes() {
		// TODO Auto-generated method stub
		return 0;
	}
}

