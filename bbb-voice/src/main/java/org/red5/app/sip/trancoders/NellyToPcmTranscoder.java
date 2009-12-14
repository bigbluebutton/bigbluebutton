package org.red5.app.sip.trancoders;

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import org.red5.app.sip.codecs.Codec;
import org.red5.app.sip.codecs.asao.ByteStream;
import org.red5.app.sip.codecs.asao.Decoder;
import org.red5.app.sip.codecs.asao.DecoderMap;
import org.red5.app.sip.stream.RtpStreamSender;

public class NellyToPcmTranscoder implements Transcoder {
    protected static Logger log = Red5LoggerFactory.getLogger( NellyToPcmTranscoder.class, "sip" );

    private static final int NELLYMOSER_DECODED_PACKET_SIZE = 256;
    private static final int NELLYMOSER_ENCODED_PACKET_SIZE = 64;
    
    private Codec sipCodec = null;	// Sip codec to be used on audio session 
    private Decoder decoder;
    private DecoderMap decoderMap;    
    float[] tempBuffer;				// Temporary buffer with received PCM audio from FlashPlayer.    
    int tempBufferRemaining = 0; 	// Floats remaining on temporary buffer.
    float[] encodingBuffer;			// Encoding buffer used to encode to final codec format;    
    int encodingOffset = 0;			// Offset of encoding buffer.    
    boolean asao_buffer_processed = false;		// Indicates whether the current asao buffer was processed.
    boolean hasInitilializedBuffers = false;	// Indicates whether the handling buffers have already been initialized.

    public NellyToPcmTranscoder(Codec sipCodec) {
    	this.sipCodec = sipCodec;
    	decoder = new Decoder();
        decoderMap = null;
    }

    public int getOutgoingEncodedFrameSize() {
    	return sipCodec.getOutgoingEncodedFrameSize();
    }

    public int getCodecId() {
    	return sipCodec.getCodecId();
    }
    
    public int getOutgoingPacketization() {
    	return sipCodec.getOutgoingPacketization();
    }
    
    private int fillRtpPacketBuffer(byte[] asaoBuffer, byte[] transcodedData, int dataOffset) {
        int copyingSize = 0;
        int finalCopySize = 0;
        byte[] codedBuffer = new byte[sipCodec.getOutgoingEncodedFrameSize()];

        try {
        	if ((tempBufferRemaining + encodingOffset) >= sipCodec.getOutgoingDecodedFrameSize()) {
        		copyingSize = encodingBuffer.length - encodingOffset;
                
                System.arraycopy(tempBuffer, tempBuffer.length-tempBufferRemaining, 
                		encodingBuffer, encodingOffset, copyingSize);

                encodingOffset = sipCodec.getOutgoingDecodedFrameSize();
                tempBufferRemaining -= copyingSize;
                finalCopySize = sipCodec.getOutgoingDecodedFrameSize();
            }
            else {
                if (tempBufferRemaining > 0) {
                    System.arraycopy(tempBuffer, tempBuffer.length - tempBufferRemaining, 
                    		encodingBuffer, encodingOffset, tempBufferRemaining);
                    		
                    encodingOffset += tempBufferRemaining;
                    finalCopySize += tempBufferRemaining;
                    tempBufferRemaining = 0;
                }

                // Decode new asao packet.
                asao_buffer_processed = true;
                ByteStream audioStream = new ByteStream( asaoBuffer, 1, NELLYMOSER_ENCODED_PACKET_SIZE );
                decoderMap = decoder.decode( decoderMap, audioStream.bytes, 1, tempBuffer, 0 );

                //tempBuffer = ResampleUtils.normalize(tempBuffer, 256); 	// normalise volume
                tempBufferRemaining = tempBuffer.length;

                if ( tempBuffer.length <= 0 ) {
                    log.error("Asao decoder Error." );
                }

                // Try to complete the encodingBuffer with necessary data.
                if ( ( encodingOffset + tempBufferRemaining ) > sipCodec.getOutgoingDecodedFrameSize() ) {
                    copyingSize = encodingBuffer.length - encodingOffset;
                }
                else {
                    copyingSize = tempBufferRemaining;
                }

                System.arraycopy(tempBuffer, 0, encodingBuffer, encodingOffset, copyingSize);

                encodingOffset += copyingSize;
                tempBufferRemaining -= copyingSize;
                finalCopySize += copyingSize;
            }

            if (encodingOffset == encodingBuffer.length)
            {
                int encodedBytes = sipCodec.pcmToCodec( encodingBuffer, codedBuffer );

                if ( encodedBytes == sipCodec.getOutgoingEncodedFrameSize() ) {
                    System.arraycopy(codedBuffer, 0, transcodedData, dataOffset, codedBuffer.length);
                }
                else {
                    //println( "fillRtpPacketBuffer", "Failure encoding buffer." );
                }
            }
        }
        catch ( Exception e ) {        	
        	log.error("Exception - " + e.toString());        	
            e.printStackTrace();
        }

        return finalCopySize;
    }

    public void transcode(byte[] asaoBuffer, int offset, int num, byte[] transcodedData, int dataOffset, RtpStreamSender rtpSender) {  
        asao_buffer_processed = false;

        if (!hasInitilializedBuffers) {
            tempBuffer = new float[NELLYMOSER_DECODED_PACKET_SIZE];
            encodingBuffer = new float[sipCodec.getOutgoingDecodedFrameSize()];
            hasInitilializedBuffers = true;
        }

        if (num > 0) {
            do {
                int encodedBytes = fillRtpPacketBuffer( asaoBuffer, transcodedData, dataOffset );
                //println( "send", sipCodec.getCodecName() + " encoded " + encodedBytes + " bytes." );

                if ( encodedBytes == 0 ) {
                    break;
                }

                if ( encodingOffset == sipCodec.getOutgoingDecodedFrameSize() ) {
//                	System.out.println("Send this audio to asterisk.");
                    rtpSender.sendTranscodedData();
                    encodingOffset = 0;
                }

                //println( "send", "asao_buffer_processed = ["
                //        + asao_buffer_processed + "] ." );
            }
            while ( !asao_buffer_processed );
        }
        else if ( num < 0 ) {
            log.debug("Closing" );
        }
    }

	public void transcode(byte[] codedBuffer) {
		// TODO Auto-generated method stub
		
	}

	public int getIncomingEncodedFrameSize() {
		// TODO Auto-generated method stub
		return 0;
	}
}
