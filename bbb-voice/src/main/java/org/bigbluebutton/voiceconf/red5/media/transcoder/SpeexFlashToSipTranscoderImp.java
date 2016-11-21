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
package org.bigbluebutton.voiceconf.red5.media.transcoder;

import java.util.Random;
import java.util.concurrent.*;

import org.bigbluebutton.voiceconf.red5.media.FlashToSipAudioStream.TranscodedAudioListener;
import org.red5.app.sip.codecs.Codec;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

/**
 * Speex wideband to Speex wideband Flash to SIP transcoder.
 * This class is just a passthrough transcoder.
 *
 */
public class SpeexFlashToSipTranscoderImp implements FlashToSipTranscoder {
	protected static Logger log = Red5LoggerFactory.getLogger(SpeexFlashToSipTranscoderImp.class, "sip");
	
	private Codec audioCodec;
	private long timestamp = 0;
	private final static int TS_INCREMENT = 320; // Determined from PCAP traces.
	
	//private final Executor exec = Executors.newSingleThreadExecutor();
	//private Runnable audioDataProcessor;
	//private volatile boolean processAudioData = false;
	//private BlockingQueue<SpeexRtpAudioData> audioDataQ;
	
	private TranscodedAudioListener transcodedAudioListener;
	
	public SpeexFlashToSipTranscoderImp(Codec audioCodec) {
		//audioDataQ = new LinkedBlockingQueue<SpeexRtpAudioData>();
		this.audioCodec = audioCodec;
        Random rgen = new Random();
        timestamp = rgen.nextInt(1000);
	}
	
	public void transcode(byte[] audioData, int startOffset, int length) {
		byte[] transcodedAudio = new byte[length];
		// Just copy the audio data removing the codec id which is the first-byte
		// represented by the startOffset var.
		System.arraycopy(audioData, startOffset, transcodedAudio, 0, length);
		
		SpeexRtpAudioData srad = new SpeexRtpAudioData(transcodedAudio, timestamp += TS_INCREMENT);
		transcodedAudioListener.handleTranscodedAudioData(srad.audioData, srad.timestamp);

		//try {
		//	audioDataQ.offer(srad, 100, TimeUnit.MILLISECONDS);
		//} catch (InterruptedException e) {
		//	log.warn("Failed to add speex audio data into queue.");
		//}
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

	@Override
	public void handlePacket(byte[] data, int begin, int end) {
		transcode(data, begin, end);		
	}

	@Override
	public void setTranscodedAudioListener(TranscodedAudioListener transcodedAudioListener) {
		this.transcodedAudioListener = transcodedAudioListener;		
	}
	
	private void processAudioData() {
		//while (processAudioData) {
		//	SpeexRtpAudioData srad;
		//	try {
		//		srad = audioDataQ.take();
		//		transcodedAudioListener.handleTranscodedAudioData(srad.audioData, srad.timestamp);
		//	} catch (InterruptedException e) {
		//		// TODO Auto-generated catch block
		//		e.printStackTrace();
		//	}
		//}
	}

    @Override
    public void start() {
    	//processAudioData = true;
	    //audioDataProcessor = new Runnable() {
    	//	public void run() {
    	//		processAudioData();
    	//	}
    	//};
    	//exec.execute(audioDataProcessor);
    }
	
	@Override
    public void stop() {
    	//processAudioData = false;
    }
}
