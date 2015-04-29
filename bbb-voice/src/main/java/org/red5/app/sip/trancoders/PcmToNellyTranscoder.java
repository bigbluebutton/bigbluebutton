package org.red5.app.sip.trancoders;

import org.slf4j.Logger;
import org.apache.mina.core.buffer.IoBuffer;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.net.rtmp.event.AudioData;

import org.red5.app.sip.codecs.Codec;
import org.red5.app.sip.codecs.asao.ByteStream;
import org.red5.app.sip.codecs.asao.CodecImpl;
import org.red5.app.sip.stream.RtpStreamSender;

public class PcmToNellyTranscoder implements Transcoder {
    protected static Logger log = Red5LoggerFactory.getLogger(PcmToNellyTranscoder.class, "sip");

    private static final int NELLYMOSER_DECODED_PACKET_SIZE = 256;
    private static final int NELLYMOSER_ENCODED_PACKET_SIZE = 64;
    private static final int NELLYMOSER_CODEC_ID = 82;
    
   	private float[] encoderMap;
    private Codec audioCodec = null;    
    private float[] tempBuffer; 		// Temporary buffer with PCM audio to be sent to FlashPlayer.
    private int tempBufferOffset = 0;
    private final TranscodedAudioDataListener listener;
    private long start = 0;
    
    public PcmToNellyTranscoder(Codec audioCodec, TranscodedAudioDataListener listener) {
    	this.audioCodec = audioCodec;
    	this.listener = listener;
    	
      	encoderMap = new float[64];
        tempBuffer = new float[NELLYMOSER_DECODED_PACKET_SIZE]; 
        start = System.currentTimeMillis();
    }

    /**
     * Fills the tempBuffer with necessary PCM's floats and encodes
     * the audio to be sent to FlashPlayer.
     */
    private void forwardAudioToFlashPlayer(float[] pcmBuffer) {
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

            if (tempBufferOffset == NELLYMOSER_DECODED_PACKET_SIZE) {
                ByteStream encodedStream = new ByteStream(NELLYMOSER_ENCODED_PACKET_SIZE);
				encoderMap = CodecImpl.encode(encoderMap, tempBuffer, encodedStream.bytes);
				pushAudio(encodedStream.bytes);

                tempBufferOffset = 0;
            }

            if ( pcmBufferOffset == pcmBuffer.length ) {
                pcmBufferProcessed = true;
            }
        }
        while (!pcmBufferProcessed);
    }

    public void transcode(byte[] codedBuffer) {
    	float[] decodingBuffer = new float[codedBuffer.length];
        int decodedBytes = audioCodec.codecToPcm(codedBuffer, decodingBuffer);

//        log.debug("encodedBytes = " + decodedBytes + ", incomingDecodedFrameSize = " +
//                audioCodec.getIncomingDecodedFrameSize() + "." );

        if (decodedBytes == audioCodec.getIncomingDecodedFrameSize()) {
            forwardAudioToFlashPlayer(decodingBuffer);
        }
        else {
            log.warn("Failure decoding buffer." );
        }    	
    }
    
    private void pushAudio(byte[] audio) {
        IoBuffer buffer = IoBuffer.allocate(1024);
        buffer.setAutoExpand(true);

        buffer.clear();

        buffer.put((byte) NELLYMOSER_CODEC_ID); 
        byte[] copy = new byte[audio.length];
	    System.arraycopy(audio, 0, copy, 0, audio.length );
        
        buffer.put(copy);        
        buffer.flip();

        AudioData audioData = new AudioData(buffer);
        audioData.setTimestamp((int)(System.currentTimeMillis() - start) );
        listener.handleTranscodedAudioData(audioData);
    }    
    
    public int getIncomingEncodedFrameSize() {
    	return audioCodec.getIncomingEncodedFrameSize();
    }

	public void transcode(byte[] asaoBuffer, int offset, int num,
			byte[] transcodedData, int dataOffset, RtpStreamSender rtpSender) {
		// TODO Auto-generated method stub
		
	}

	public int getCodecId() {
		// TODO Auto-generated method stub
		return 0;
	}

	public int getOutgoingEncodedFrameSize() {
		// TODO Auto-generated method stub
		return 0;
	}

	public int getOutgoingPacketization() {
		// TODO Auto-generated method stub
		return 0;
	}
}
