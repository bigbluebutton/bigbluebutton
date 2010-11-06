/** 
*
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
**/
package org.bigbluebutton.voiceconf.red5.media.transcoder;

import java.util.Random;

import org.bigbluebutton.voiceconf.red5.media.AudioByteData;
import org.red5.app.sip.codecs.Codec;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class SpeexSipToFlashTranscoderImp implements SipToFlashTranscoder {
	protected static Logger log = Red5LoggerFactory.getLogger(SpeexSipToFlashTranscoderImp.class, "sip");
	
	private static final int SPEEX_CODEC = 178; /* 1011 1111 (see flv spec) */
	private Codec audioCodec = null;
	private long timestamp = 0;
	private static final int TS_INCREMENT = 20; // Determined from PCAP traces.
	
	public SpeexSipToFlashTranscoderImp(Codec codec) {
		this.audioCodec = codec;
        Random rgen = new Random();
        timestamp = rgen.nextInt(1000);
	}

	@Override
	public void transcode(AudioByteData audioData, TranscodedAudioDataListener listener) {
		byte[] codedBuffer = audioData.getData();
		listener.handleTranscodedAudioData(codedBuffer, timestamp += TS_INCREMENT);
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
