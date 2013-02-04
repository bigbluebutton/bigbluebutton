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

import java.io.IOException;
import java.io.PipedInputStream;
import java.io.PipedOutputStream;
import java.nio.FloatBuffer;
import java.util.Random;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

import org.slf4j.Logger;
import org.bigbluebutton.voiceconf.red5.media.FlashToSipAudioStream.TranscodedAudioListener;
import org.red5.logging.Red5LoggerFactory;
import org.red5.app.sip.codecs.Codec;
import org.red5.app.sip.codecs.asao.Decoder;
import org.red5.app.sip.codecs.asao.DecoderMap;

/**
 * Transcodes audio from voice conferencing server to Flash.
 * Specifically U-law to Nelly.
 * @author Richard Alam
 *
 */
public class NellyFlashToSipTranscoderImp implements FlashToSipTranscoder {
    protected static Logger log = Red5LoggerFactory.getLogger( NellyFlashToSipTranscoderImp.class, "sip" );

    private static final int NELLY_TO_L16_AUDIO_SIZE = 256;
    private static final int NELLY_AUDIO_LENGTH = 64;
    private static final int ULAW_AUDIO_LENGTH = 160;
    
    /**
     * Max buffer length when 5 Nelly/L16 packets equals 8 Ulaw packets.
     */
    private static final int MAX_BUFFER_LENGTH = 1280;
    /**
     * Allocate a fixed buffer length so we don't have to copy elements around. We'll use the
     * position, limit, mart attributes of the NIO Buffer.
     */
    private final FloatBuffer l16Audio = FloatBuffer.allocate(MAX_BUFFER_LENGTH);
    /**
     * This is a view read-only copy of the buffer to track which byte are being transcoded from L16->Ulaw
     */
    private FloatBuffer viewBuffer;
    
    private Codec sipCodec = null;						
    private Decoder decoder;
    private DecoderMap decoderMap;    
    private float[] tempL16Buffer = new float[NELLY_TO_L16_AUDIO_SIZE];							  
    private float[] tempUlawBuffer = new float[ULAW_AUDIO_LENGTH];						    
    private byte[] ulawEncodedBuffer = new byte[ULAW_AUDIO_LENGTH];
    
    private long timestamp = 0;
    private final static int TS_INCREMENT = 180;		// Determined from PCAP traces.

	private final PipedOutputStream streamFromFlash;
	private PipedInputStream streamToSip;
	
	private final Executor exec = Executors.newSingleThreadExecutor();
	private Runnable audioDataProcessor;
	private volatile boolean processAudioData = false;
	private TranscodedAudioListener transcodedAudioListener;
	
	/**
	 * The transcode process works by taking a 64-byte-array Nelly audio and converting it into a 256-float-array L16 audio. From the 
	 * 256-float-array L16 audio, we take 160-float-array and convert it to a 160-byte-array Ulaw audio. The remaining 96-float-array
	 * will be used in the next iteration.
	 * Therefore, 5 Nelly/L16 packets (5x256 = 1280) will result into 8 Ulaw packets (8x160 = 1280). 
	 *
	 */
    public NellyFlashToSipTranscoderImp(Codec sipCodec) {
    	this.sipCodec = sipCodec;
    	decoder = new Decoder();
        decoderMap = null;
        Random rgen = new Random();
        timestamp = rgen.nextInt(1000);
        viewBuffer = l16Audio.asReadOnlyBuffer();
        
		streamFromFlash = new PipedOutputStream();
		try {
			streamToSip = new PipedInputStream(streamFromFlash);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    }
    
    @Override
    public void start() {
    	processAudioData = true;	 
	    audioDataProcessor = new Runnable() {
    		public void run() {
    			processAudioData();   			
    		}
    	};
    	exec.execute(audioDataProcessor);
    }

    @Override
    public int getOutgoingEncodedFrameSize() {
    	return sipCodec.getOutgoingEncodedFrameSize();
    }

    @Override
    public int getCodecId() {
    	return sipCodec.getCodecId();
    }
    
    @Override
    public void handlePacket(byte[] data, int begin, int end) {
		try {
			streamFromFlash.write(data, begin, end);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}    	
    }

	private void processAudioData() {
		int len = 64;
		byte[] nellyAudio = new byte[len];		
		int remaining = len;
		int offset = 0;
		
		while (processAudioData) {			
			try {
				int bytesRead =  streamToSip.read(nellyAudio, offset, remaining);
				remaining -= bytesRead;
				if (remaining == 0) {
					remaining = len;
					offset = 0;
					transcode(nellyAudio, 0, nellyAudio.length);
				} else {
					offset += bytesRead; 
				}
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}        		
		}	
	}
	
	@Override
	public void transcode(byte[] audioData, int startOffset, int length) {
		if (audioData.length != NELLY_AUDIO_LENGTH) {
			if (log.isWarnEnabled()) log.warn("Receiving bad nelly audio. Expecting {}, got {}.", NELLY_AUDIO_LENGTH, audioData.length);
			return;
		}
				
		// Convert the Nelly audio to L16.
    	decoderMap = decoder.decode(decoderMap, audioData, 0, tempL16Buffer, 0);
    	
    	// Store the L16 audio into the buffer
    	l16Audio.put(tempL16Buffer);
    	
    	// Read 160-float worth of audio
    	viewBuffer.get(tempUlawBuffer);
    	
    	// Convert the L16 audio to Ulaw
    	int encodedBytes = sipCodec.pcmToCodec(tempUlawBuffer, ulawEncodedBuffer);

    	// Send it to the server
    	transcodedAudioListener.handleTranscodedAudioData(ulawEncodedBuffer, timestamp += TS_INCREMENT);
     	
    	if (l16Audio.position() == l16Audio.capacity()) {
    		/**
    		 *  This means we already processed 5 Nelly packets and sent 5 Ulaw packets. 
    		 *  However, we have 3 extra Ulaw packets.
    		 *  Fire them off to the server. We don't want to discard them as it will
    		 *  result in choppy audio.
    		 */
    		
    		// Get the 6th packet and send
    		viewBuffer.get(tempUlawBuffer);
        	encodedBytes = sipCodec.pcmToCodec(tempUlawBuffer, ulawEncodedBuffer);
        	if (encodedBytes == sipCodec.getOutgoingEncodedFrameSize()) {
        		transcodedAudioListener.handleTranscodedAudioData(ulawEncodedBuffer, timestamp += TS_INCREMENT);
        	} else {
        		log.error("Failure encoding buffer." );
        	}
        	
        	// Get the 7th packet and send
        	viewBuffer.get(tempUlawBuffer);
        	encodedBytes = sipCodec.pcmToCodec(tempUlawBuffer, ulawEncodedBuffer);
        	if (encodedBytes == sipCodec.getOutgoingEncodedFrameSize()) {
        		transcodedAudioListener.handleTranscodedAudioData(ulawEncodedBuffer, timestamp += TS_INCREMENT);
        	} else {
        		log.error("Failure encoding buffer." );
        	}

        	// Get the 8th packet and send
        	viewBuffer.get(tempUlawBuffer);
        	encodedBytes = sipCodec.pcmToCodec(tempUlawBuffer, ulawEncodedBuffer);
        	if (encodedBytes == sipCodec.getOutgoingEncodedFrameSize()) {
        		transcodedAudioListener.handleTranscodedAudioData(ulawEncodedBuffer, timestamp += TS_INCREMENT);
        	} else {
        		log.error("Failure encoding buffer." );
        	}
        	
        	// Reset the buffer's position back to zero and start over.
    		l16Audio.clear();
    		viewBuffer.clear();
    	}
	}	
	
	public void setTranscodedAudioListener(TranscodedAudioListener transcodedAudioListener) {
		this.transcodedAudioListener = transcodedAudioListener;
	}
	
	@Override
    public void stop() {
    	processAudioData = false;
    }

}
