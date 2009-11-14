package org.red5.app.sip;

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

import org.red5.app.sip.codecs.Codec;
import org.red5.app.sip.codecs.asao.ByteStream;
import org.red5.app.sip.codecs.asao.CodecImpl;

public class PcmToNellyTranscoder {
    protected static Logger log = Red5LoggerFactory.getLogger( PcmToNellyTranscoder.class, "sip" );

    private static final int NELLYMOSER_DECODED_PACKET_SIZE = 256;
    private static final int NELLYMOSER_ENCODED_PACKET_SIZE = 64;

   	private float[] encoderMap;
    private Codec audioCodec = null;

    // Temporary buffer with PCM audio to be sent to FlashPlayer.
    private float[] tempBuffer;
    private int tempBufferOffset = 0;

    public PcmToNellyTranscoder(Codec audioCodec) {
    	this.audioCodec = audioCodec;
      	encoderMap = new float[64];
        tempBuffer = new float[ NELLYMOSER_DECODED_PACKET_SIZE ]; 
    }

    /**
     * Fills the tempBuffer with necessary PCM's floats and encodes
     * the audio to be sent to FlashPlayer.
     */
    private void forwardAudioToFlashPlayer(float[] pcmBuffer, RtpReceiver rtpReceiver) {
        int pcmBufferOffset = 0;
        int copySize = 0;
        boolean pcmBufferProcessed = false;

        do {
            if ((tempBuffer.length - tempBufferOffset) <= (pcmBuffer.length - pcmBufferOffset)) {
                copySize = tempBuffer.length - tempBufferOffset;
            }
            else {
                copySize = pcmBuffer.length - pcmBufferOffset;
            }

            System.arraycopy( pcmBuffer, pcmBufferOffset, tempBuffer, tempBufferOffset, copySize);
            
            tempBufferOffset += copySize;
            pcmBufferOffset += copySize;

            if ( tempBufferOffset == NELLYMOSER_DECODED_PACKET_SIZE ) {
                ByteStream encodedStream = new ByteStream( NELLYMOSER_ENCODED_PACKET_SIZE );

                try {
                    // First byte indicates audio format:
                    //     2 mono 5500;
                    //     6 mono 11025;
                    //     22 mono 11025 adpcm;
                    //     82 nellymoser 8000;
                    //     178 speex 8000.

                    //tempBuffer = ResampleUtils.normalize(tempBuffer, 256); 	// normalise volume

                    if (true) {
						encoderMap = CodecImpl.encode(encoderMap, tempBuffer, encodedStream.bytes);
//					    rtmpUser.pushAudio(NELLYMOSER_ENCODED_PACKET_SIZE, encodedStream.bytes, timeStamp, 82);
						rtpReceiver.pushAudio(NELLYMOSER_ENCODED_PACKET_SIZE, encodedStream.bytes, 82);
                    }
                    else {
                        byte[] aux = ResampleUtils.resample((float) ( 8.0 / 11.025 ), tempBuffer );
//                        rtmpUser.pushAudio( aux.length, aux, timeStamp, 6 );
                    }
                }
                catch ( Exception exception ) {
//                    println( "forwardAudioToFlashPlayer", "asao Encoder Error." );
                }

                tempBufferOffset = 0;
            }

            if ( pcmBufferOffset == pcmBuffer.length ) {
                pcmBufferProcessed = true;
            }

//            println( "forwardAudioToFlashPlayer",
//                    "pcmBufferProcessed = " + pcmBufferProcessed + "." );
        }
        while ( !pcmBufferProcessed );
    }

    public void transcode(byte[] codedBuffer, RtpReceiver rtpReceiver ) {
    	float[] decodingBuffer = new float[codedBuffer.length];
        int decodedBytes = audioCodec.codecToPcm( codedBuffer, decodingBuffer );

        log.debug("encodedBytes = " + decodedBytes + ", incomingDecodedFrameSize = " +
                audioCodec.getIncomingDecodedFrameSize() + "." );

        if ( decodedBytes == audioCodec.getIncomingDecodedFrameSize() ) {
            forwardAudioToFlashPlayer(decodingBuffer, rtpReceiver);
        }
        else {
            log.warn("Failure decoding buffer." );
        }    	
    }
    
    public int getIncomingEncodedFrameSize() {
    	return audioCodec.getIncomingEncodedFrameSize();
    }
}
