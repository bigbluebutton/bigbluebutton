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

import java.nio.FloatBuffer;
import java.util.Random;

import org.slf4j.Logger;
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

    private static final int NELLYMOSER_DECODED_PACKET_SIZE = 256;
    private static final int NELLYMOSER_ENCODED_PACKET_SIZE = 64;
    private static final int MAX_BYTE = 1280;
    private final FloatBuffer nellyAudio = FloatBuffer.allocate(1280);
    private FloatBuffer ulawAudio;
    
    private Codec sipCodec = null;						// Sip codec to be used on audio session 
    private Decoder decoder;
    private DecoderMap decoderMap;    
    private float[] tempBuffer = new float[NELLYMOSER_DECODED_PACKET_SIZE];							// Temporary buffer with received PCM audio from FlashPlayer.    
    private float[] encodingBuffer;						// Encoding buffer used to encode to final codec format;    

    private long timestamp = 0;
    private final static int TS_INCREMENT = 180;		// Determined from PCAP traces.
    
    public NellyFlashToSipTranscoderImp(Codec sipCodec) {
    	this.sipCodec = sipCodec;
    	encodingBuffer = new float[sipCodec.getOutgoingDecodedFrameSize()];
    	decoder = new Decoder();
        decoderMap = null;
        Random rgen = new Random();
        timestamp = rgen.nextInt(1000);
        ulawAudio = nellyAudio.asReadOnlyBuffer();
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
	public void transcode(byte[] audioData, int startOffset, int length, TranscodedAudioDataListener listener) {
		byte[] codedBuffer = new byte[160];
    	decoderMap = decoder.decode(decoderMap, audioData, 0, tempBuffer, 0);
    	nellyAudio.put(tempBuffer);
    	ulawAudio.get(encodingBuffer);
    	int encodedBytes = sipCodec.pcmToCodec(encodingBuffer, codedBuffer);

    	listener.handleTranscodedAudioData(codedBuffer, timestamp += TS_INCREMENT);
     	
    	if (nellyAudio.position() == nellyAudio.capacity()) {
        	ulawAudio.get(encodingBuffer);
        	encodedBytes = sipCodec.pcmToCodec(encodingBuffer, codedBuffer);

        	if (encodedBytes == sipCodec.getOutgoingEncodedFrameSize()) {
        		listener.handleTranscodedAudioData(codedBuffer, timestamp += TS_INCREMENT);
        	} else {
        		log.error("Failure encoding buffer." );
        	}
        	ulawAudio.get(encodingBuffer);
        	encodedBytes = sipCodec.pcmToCodec(encodingBuffer, codedBuffer);

        	if (encodedBytes == sipCodec.getOutgoingEncodedFrameSize()) {
        		listener.handleTranscodedAudioData(codedBuffer, timestamp += TS_INCREMENT);
        	} else {
        		log.error("Failure encoding buffer." );
        	}
        	
        	if (encodedBytes == sipCodec.getOutgoingEncodedFrameSize()) {
        		listener.handleTranscodedAudioData(codedBuffer, timestamp += TS_INCREMENT);
        	} else {
        		log.error("Failure encoding buffer." );
        	}
    		nellyAudio.clear();
    		ulawAudio.clear();
    	}
	}	
}
