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

import org.slf4j.Logger;
import org.bigbluebutton.voiceconf.red5.media.AudioByteData;
import org.red5.logging.Red5LoggerFactory;
import org.red5.app.sip.codecs.Codec;
import org.red5.app.sip.codecs.asao.ByteStream;
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
    
    private Codec sipCodec = null;				// Sip codec to be used on audio session 
    private Decoder decoder;
    private DecoderMap decoderMap;    
    private float[] tempBuffer;							// Temporary buffer with received PCM audio from FlashPlayer.    
    private int tempBufferRemaining = 0; 				// Floats remaining on temporary buffer.
    private float[] encodingBuffer;						// Encoding buffer used to encode to final codec format;    
    private int encodingOffset = 0;						// Offset of encoding buffer.    
    private boolean asao_buffer_processed = false;		// Indicates whether the current asao buffer was processed.
    private boolean hasInitilializedBuffers = false;	// Indicates whether the handling buffers have already been initialized.

    private long timestamp = 0;
    private final static int TS_INCREMENT = 180;		// Determined from PCAP traces.
    
    public NellyFlashToSipTranscoderImp(Codec sipCodec) {
    	this.sipCodec = sipCodec;
    	decoder = new Decoder();
        decoderMap = null;
        Random rgen = new Random();
        timestamp = rgen.nextInt(1000);
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
	public void transcode(AudioByteData audioData, int startOffset, int length, TranscodedAudioDataListener listener) {
		byte[] codedBuffer = new byte[length];
		System.arraycopy(audioData.getData(), startOffset, codedBuffer, 0, length);
		byte[] transcodedAudioData = new byte[sipCodec.getOutgoingEncodedFrameSize()];
		
        asao_buffer_processed = false;

        if (!hasInitilializedBuffers) {
            tempBuffer = new float[NELLYMOSER_DECODED_PACKET_SIZE];
            encodingBuffer = new float[sipCodec.getOutgoingDecodedFrameSize()];
            hasInitilializedBuffers = true;
        }

        if (length > 0) {
            do {
                int encodedBytes = fillRtpPacketBuffer(codedBuffer, transcodedAudioData);
                if (encodedBytes == 0) {
                    break;
                }

                if (encodingOffset == sipCodec.getOutgoingDecodedFrameSize()) {
                    encodingOffset = 0;
                    listener.handleTranscodedAudioData(transcodedAudioData, timestamp += TS_INCREMENT);
                }
            } while (!asao_buffer_processed);
        }
	}
	
    private int fillRtpPacketBuffer(byte[] audioData, byte[] transcodedAudioData) {
        int copyingSize = 0;
        int finalCopySize = 0;
        byte[] codedBuffer = new byte[sipCodec.getOutgoingEncodedFrameSize()];

        if ((tempBufferRemaining + encodingOffset) >= sipCodec.getOutgoingDecodedFrameSize()) {
        	copyingSize = encodingBuffer.length - encodingOffset;
                
        	System.arraycopy(tempBuffer, tempBuffer.length-tempBufferRemaining, encodingBuffer, encodingOffset, copyingSize);

        	encodingOffset = sipCodec.getOutgoingDecodedFrameSize();
        	tempBufferRemaining -= copyingSize;
        	finalCopySize = sipCodec.getOutgoingDecodedFrameSize();
        } else {
        	if (tempBufferRemaining > 0) {
        		System.arraycopy(tempBuffer, tempBuffer.length - tempBufferRemaining, encodingBuffer, encodingOffset, tempBufferRemaining);
                    		
        		encodingOffset += tempBufferRemaining;
        		finalCopySize += tempBufferRemaining;
        		tempBufferRemaining = 0;
        	}

        	// Decode new asao packet.
        	asao_buffer_processed = true;
        	ByteStream audioStream = new ByteStream(audioData, 0, NELLYMOSER_ENCODED_PACKET_SIZE);
        	decoderMap = decoder.decode(decoderMap, audioStream.bytes, 0, tempBuffer, 0);

        	tempBufferRemaining = tempBuffer.length;

        	if (tempBuffer.length <= 0) {
        		log.error("Asao decoder Error." );
        	}

        	// Try to complete the encodingBuffer with necessary data.
        	if ((encodingOffset + tempBufferRemaining) > sipCodec.getOutgoingDecodedFrameSize()) {
        		copyingSize = encodingBuffer.length - encodingOffset;
        	} else {
        		copyingSize = tempBufferRemaining;
        	}

        	System.arraycopy(tempBuffer, 0, encodingBuffer, encodingOffset, copyingSize);

        	encodingOffset += copyingSize;
        	tempBufferRemaining -= copyingSize;
        	finalCopySize += copyingSize;
        }

        if (encodingOffset == encodingBuffer.length) {
        	int encodedBytes = sipCodec.pcmToCodec(encodingBuffer, codedBuffer);

        	if (encodedBytes == sipCodec.getOutgoingEncodedFrameSize()) {
        		System.arraycopy(codedBuffer, 0, transcodedAudioData, 0, codedBuffer.length);
        	} else {
        		log.error("Failure encoding buffer." );
        	}
        }

        return finalCopySize;
    }
}
