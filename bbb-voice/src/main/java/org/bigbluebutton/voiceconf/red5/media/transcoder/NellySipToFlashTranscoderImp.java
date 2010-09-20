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

import java.io.IOException;
import java.io.PipedInputStream;
import java.io.PipedOutputStream;
import java.util.Random;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

import org.slf4j.Logger;
import org.bigbluebutton.voiceconf.red5.media.AudioByteData;
import org.bigbluebutton.voiceconf.util.StackTraceUtil;
import org.red5.logging.Red5LoggerFactory;
import org.red5.app.sip.codecs.Codec;
import org.red5.app.sip.codecs.asao.ByteStream;
import org.red5.app.sip.codecs.asao.CodecImpl;

public class NellySipToFlashTranscoderImp implements SipToFlashTranscoder {
    protected static Logger log = Red5LoggerFactory.getLogger(NellySipToFlashTranscoderImp.class, "sip");

    private static final int NELLYMOSER_DECODED_PACKET_SIZE = 256;
    private static final int NELLYMOSER_ENCODED_PACKET_SIZE = 64;
    private static final int NELLYMOSER_CODEC_ID = 82;
    
    private final Executor exec = Executors.newSingleThreadExecutor();
	private Runnable byteStreamProcessor;
	private volatile boolean processByteStream = false;
	
	private final PipedInputStream audioInputStream;
	private final PipedOutputStream audioOutputStream;
	
   	private float[] encoderMap;
    private Codec audioCodec = null;    
    private float[] tempBuffer; 		// Temporary buffer with PCM audio to be sent to FlashPlayer.
    private int tempBufferOffset = 0;

    private long timestamp = 0;
    private final static int TS_INCREMENT = 32; // Determined from PCAP traces.
    
    public NellySipToFlashTranscoderImp(Codec audioCodec) {
    	this.audioCodec = audioCodec;    	    	
      	encoderMap = new float[64];
        tempBuffer = new float[NELLYMOSER_DECODED_PACKET_SIZE];
        
        Random rgen = new Random();
        timestamp = rgen.nextInt(1000);
    	audioOutputStream = new PipedOutputStream();
		audioInputStream = new PipedInputStream();
		
        try {
			audioInputStream.connect(audioOutputStream);
		} catch (IOException e) {
			log.error(StackTraceUtil.getStackTrace(e));
		}
/*        
        processByteStream = true;
        byteStreamProcessor = new Runnable() {
    		public void run() {
    			processByteStreamAudio();   			
    		}
    	};
    	exec.execute(byteStreamProcessor);
*/    }
    
//    private void processByteStreamAudio() {
 //   	while (processByteStream) {
 //   		
 //   	}
 //   }

	private void transcodeAudioStream(TranscodedAudioDataListener listener) {
		int numAvailBytes = 0;
		
		try {
			numAvailBytes = audioInputStream.available();
			if (numAvailBytes < audioCodec.getIncomingDecodedFrameSize()) return;
			byte[] codedBuffer = new byte[audioCodec.getIncomingDecodedFrameSize()];
			audioInputStream.read(codedBuffer);
			transcodePcmToNellymoser(codedBuffer, listener);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	
	private void transcodePcmToNellymoser(byte[] codedBuffer, TranscodedAudioDataListener listener) {		
    	float[] decodingBuffer = new float[codedBuffer.length];
        int decodedBytes = audioCodec.codecToPcm(codedBuffer, decodingBuffer);

        if (decodedBytes == audioCodec.getIncomingDecodedFrameSize()) {
        	int pcmBufferOffset = 0;
            int copySize = 0;
            boolean pcmBufferProcessed = false;

            do {
                if ((tempBuffer.length - tempBufferOffset) <= (decodingBuffer.length - pcmBufferOffset)) {
                    copySize = tempBuffer.length - tempBufferOffset;
                } else {
                    copySize = decodingBuffer.length - pcmBufferOffset;
                }

                System.arraycopy(decodingBuffer, pcmBufferOffset, tempBuffer, tempBufferOffset, copySize);
                
                tempBufferOffset += copySize;
                pcmBufferOffset += copySize;

                if (tempBufferOffset == NELLYMOSER_DECODED_PACKET_SIZE) {
                    ByteStream encodedStream = new ByteStream(NELLYMOSER_ENCODED_PACKET_SIZE);
    				encoderMap = CodecImpl.encode(encoderMap, tempBuffer, encodedStream.bytes);
    				tempBufferOffset = 0;
    				listener.handleTranscodedAudioData(encodedStream.bytes, timestamp += TS_INCREMENT);
                }

                if (pcmBufferOffset == decodingBuffer.length) {
                    pcmBufferProcessed = true;
                }
            } while (!pcmBufferProcessed);
        } else {
        	log.warn("[IncomingBytes=" + codedBuffer.length + ",DecodedBytes=" + decodedBytes +", ExpectedDecodedBytes=" + audioCodec.getIncomingDecodedFrameSize() +"]");
        }      
    }

	@Override
	public void transcode(AudioByteData audioData, TranscodedAudioDataListener listener) {
		try {
			audioOutputStream.write(audioData.getData());
			transcodeAudioStream(listener);
		} catch (IOException e) {
			log.error(StackTraceUtil.getStackTrace(e));
		}  
    }
/*	
	@Override
	public void transcode(AudioByteData audioData, TranscodedAudioDataListener listener) {
		byte[] codedBuffer = audioData.getData();
    	float[] decodingBuffer = new float[codedBuffer.length];
        int decodedBytes = audioCodec.codecToPcm(codedBuffer, decodingBuffer);

        if (decodedBytes == audioCodec.getIncomingDecodedFrameSize()) {
        	int pcmBufferOffset = 0;
            int copySize = 0;
            boolean pcmBufferProcessed = false;

            do {
                if ((tempBuffer.length - tempBufferOffset) <= (decodingBuffer.length - pcmBufferOffset)) {
                    copySize = tempBuffer.length - tempBufferOffset;
                } else {
                    copySize = decodingBuffer.length - pcmBufferOffset;
                }

                System.arraycopy(decodingBuffer, pcmBufferOffset, tempBuffer, tempBufferOffset, copySize);
                
                tempBufferOffset += copySize;
                pcmBufferOffset += copySize;

                if (tempBufferOffset == NELLYMOSER_DECODED_PACKET_SIZE) {
                    ByteStream encodedStream = new ByteStream(NELLYMOSER_ENCODED_PACKET_SIZE);
    				encoderMap = CodecImpl.encode(encoderMap, tempBuffer, encodedStream.bytes);
    				tempBufferOffset = 0;
    				listener.handleTranscodedAudioData(encodedStream.bytes, timestamp += TS_INCREMENT);
                }

                if (pcmBufferOffset == decodingBuffer.length) {
                    pcmBufferProcessed = true;
                }
            } while (!pcmBufferProcessed);
        } else {
        	log.warn("[IncomingBytes=" + codedBuffer.length + ",DecodedBytes=" + decodedBytes +", ExpectedDecodedBytes=" + audioCodec.getIncomingDecodedFrameSize() +"]");
        }      
    }
*/
	
	@Override 
    public int getIncomingEncodedFrameSize() {
    	return audioCodec.getIncomingEncodedFrameSize();
    }

	@Override
	public int getCodecId() {
		return NELLYMOSER_CODEC_ID;
	}
}
