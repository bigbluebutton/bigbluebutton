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

import org.bigbluebutton.voiceconf.red5.media.AudioByteData;
import org.red5.app.sip.codecs.Codec;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class SpeexSipToFlashTranscoderImp implements SipToFlashTranscoder {
	protected static Logger log = Red5LoggerFactory.getLogger(SpeexSipToFlashTranscoderImp.class, "sip");
	
	private static final int SPEEX_CODEC = 178; /* 1011 1111 (see flv spec) */
	private Codec audioCodec = null;
	private byte[] buffer1;
	private byte[] buffer2;
	private byte[] buffer3;
	private int freebuffer = 1;
	
	public SpeexSipToFlashTranscoderImp(Codec codec) {
		this.audioCodec = codec;
	}

	@Override
	public void transcode(AudioByteData audioData, TranscodedAudioDataListener listener) {
		byte[] codedBuffer = audioData.getData();
/*
		if (freebuffer == 1) {
			buffer1 = new byte[codedBuffer.length];
			System.arraycopy(codedBuffer, 0, buffer1, 0, codedBuffer.length);
			freebuffer = 2;
//			buffer3 = null;
		} else if (freebuffer == 2) {
			buffer2 = new byte[codedBuffer.length];
			System.arraycopy(codedBuffer, 0, buffer2, 0, codedBuffer.length);
			freebuffer = 3;
		} else if (freebuffer == 3) {
			buffer3 = new byte[buffer1.length + buffer2.length + codedBuffer.length];
			System.arraycopy(buffer1, 0, buffer3, 0, buffer1.length);
			System.arraycopy(buffer2, 0, buffer3, buffer1.length - 1, buffer2.length);
			System.arraycopy(codedBuffer, 0, buffer3, buffer1.length + buffer2.length - 1, codedBuffer.length);
			freebuffer = 1;
			listener.handleTranscodedAudioData(buffer3);
//			buffer1 = null;
//			buffer2 = null;
		} else {
			log.warn("Illegal state for transcoding buffer: {}", freebuffer);
		}
*/
		listener.handleTranscodedAudioData(codedBuffer, audioData.getTimestamp());
	}
	
	@Override
	public int getCodecId() {
		return SPEEX_CODEC;
	}

	@Override
	public int getIncomingEncodedFrameSize() {
		return audioCodec.getIncomingEncodedFrameSize();
	}


}
