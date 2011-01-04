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
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IConnection;
import org.red5.server.api.Red5;
import org.red5.server.net.rtmp.RTMPMinaConnection;
import org.red5.app.sip.codecs.Codec;
import org.red5.app.sip.codecs.asao.ByteStream;
import org.red5.app.sip.codecs.asao.CodecImpl;

public class NellySipToFlashTranscoderImp implements SipToFlashTranscoder {
    protected static Logger log = Red5LoggerFactory.getLogger(NellySipToFlashTranscoderImp.class, "sip");

    private static final int NELLYMOSER_DECODED_PACKET_SIZE = 256;
    private static final int NELLYMOSER_ENCODED_PACKET_SIZE = 64;
    private static final int NELLYMOSER_CODEC_ID = 82;
    	
   	private float[] encoderMap;
    private Codec audioCodec = null;    
    private float[] tempBuffer; 					// Temporary buffer with PCM audio to be sent to FlashPlayer.
    private int tempBufferOffset = 0;

    private long timestamp = 0;
    private final static int TS_INCREMENT = 32; 	// Determined from PCAP traces.
    
    public NellySipToFlashTranscoderImp(Codec audioCodec) {
    	this.audioCodec = audioCodec;    	    	
      	encoderMap = new float[64];
        tempBuffer = new float[NELLYMOSER_DECODED_PACKET_SIZE];
        
        Random rgen = new Random();
        timestamp = rgen.nextInt(1000);
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
    				boolean sendPacket = true;
    				
    				IConnection conn = Red5.getConnectionLocal();
    				if (conn instanceof RTMPMinaConnection) {
    					long pendingMessages = ((RTMPMinaConnection)conn).getPendingMessages();
    					if (pendingMessages > 25) {   
    						sendPacket = false;
    						// Message backed up probably due to slow connection to client (10 message * 20ms ptime = 200 audio) 
        					log.info("Dropping packet. Connection {} congested with {} pending messages (~500ms worth of audio) .", conn.getClient().getId(), pendingMessages);
    					}    					
    				} 
    					
    				if (sendPacket) listener.handleTranscodedAudioData(encodedStream.bytes, timestamp += TS_INCREMENT);
    				
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
	public void transcode(byte[] audioData, TranscodedAudioDataListener listener) {
		transcodePcmToNellymoser(audioData, listener);     
    }

	
	@Override 
    public int getIncomingEncodedFrameSize() {
    	return audioCodec.getIncomingEncodedFrameSize();
    }

	@Override
	public int getCodecId() {
		return NELLYMOSER_CODEC_ID;
	}
}

