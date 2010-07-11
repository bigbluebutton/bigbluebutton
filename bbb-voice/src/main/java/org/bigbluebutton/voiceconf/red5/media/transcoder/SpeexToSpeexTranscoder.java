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

import org.apache.mina.core.buffer.IoBuffer;
import org.bigbluebutton.voiceconf.red5.media.RtpStreamSender;
import org.bigbluebutton.voiceconf.red5.media.StreamException;
import org.red5.app.sip.codecs.Codec;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.net.rtmp.event.AudioData;
import org.slf4j.Logger;

public class SpeexToSpeexTranscoder implements Transcoder {
	protected static Logger log = Red5LoggerFactory.getLogger(SpeexToSpeexTranscoder.class, "sip");
	
	private Codec audioCodec;
	private TranscodedAudioDataListener listener;
	private int timestamp = 0;
	
	private static final int SPEEX_CODEC = 178; /* 1011 1111 (see flv spec) */
	
	public SpeexToSpeexTranscoder(Codec audioCodec, TranscodedAudioDataListener listener) {
		this.audioCodec = audioCodec;
		this.listener = listener;
	}
	
	public SpeexToSpeexTranscoder(Codec audioCodec) {
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

	public void transcode(byte[] codedBuffer) {
		pushAudio(codedBuffer);
	}

	private void pushAudio(byte[] audio) {
    	timestamp = timestamp + audio.length;
    	
        IoBuffer buffer = IoBuffer.allocate(1024);
        buffer.setAutoExpand(true);

        buffer.clear();

        buffer.put((byte) SPEEX_CODEC); 
        byte[] copy = new byte[audio.length];
	    System.arraycopy(audio, 0, copy, 0, audio.length );
        
        buffer.put(copy);        
        buffer.flip();

        AudioData audioData = new AudioData( buffer );
        audioData.setTimestamp((int)timestamp );

        listener.handleTranscodedAudioData(audioData);
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

	public int getIncomingEncodedFrameSize() {
		return audioCodec.getIncomingEncodedFrameSize();
	}
}
