/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.voiceconf.red5.media.transcoder;

import org.bigbluebutton.voiceconf.red5.media.RtpStreamSender;
import org.bigbluebutton.voiceconf.red5.media.StreamException;
import org.red5.app.sip.codecs.Codec;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class RtmpToRtpSpeexTranscoder implements Transcoder {
	protected static Logger log = Red5LoggerFactory.getLogger(RtmpToRtpSpeexTranscoder.class, "sip");
	
	private Codec audioCodec;

	public RtmpToRtpSpeexTranscoder(Codec audioCodec) {
		this.audioCodec = audioCodec;
	}
	
	public void transcode(byte[] asaoBuffer, int offset, int num,
			byte[] transcodedData, int dataOffset, RtpStreamSender rtpSender) {
		System.arraycopy(asaoBuffer, offset, transcodedData, dataOffset, num);
		try {
			rtpSender.sendTranscodedData();
		} catch (StreamException e) {
			// Swallow this error for now. We don't really want to end the call if sending hiccups.
			// Just log it for now. (ralam june 18, 2010)
			log.warn("Error while sending transcoded audio packet.");
		}
	}

	/**
     * Not implemented. Implemented by transcoders for voice conf server to Flash.
     */
	public void addTranscodedAudioDataListener(TranscodedAudioDataListener listener) {
		log.error("Not implemented.");
    }
	
	/**
     * Not implemented. Implemented by transcoders for voice conf server to Flash.
     */
	public void transcode(byte[] codedBuffer) {
		log.error("Not implemented.");		
	}

    /**
     * Not implemented. Implemented by transcoders for voice conf server to Flash.
     */
	public int getIncomingEncodedFrameSize() {
		log.error("Not implemented.");	
		return 0;
	}

	public int getCodecId() {
		return audioCodec.getCodecId();
	}

	public int getOutgoingEncodedFrameSize() {
		return audioCodec.getOutgoingEncodedFrameSize();
	}

	public int getOutgoingPacketization() {
		return audioCodec.getOutgoingPacketization();
	}
}
