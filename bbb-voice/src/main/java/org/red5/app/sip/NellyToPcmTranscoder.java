package org.red5.app.sip;

import local.net.RtpPacket;
import local.net.RtpSocket;
import java.net.InetAddress;
import java.net.DatagramSocket;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import org.red5.app.sip.codecs.Codec;
import org.red5.app.sip.codecs.asao.ByteStream;
import org.red5.app.sip.codecs.asao.Decoder;
import org.red5.app.sip.codecs.asao.DecoderMap;

public class NellyToPcmTranscoder {
    protected static Logger log = Red5LoggerFactory.getLogger( NellyToPcmTranscoder.class, "sip" );

    private static final int NELLYMOSER_DECODED_PACKET_SIZE = 256;
    private static final int NELLYMOSER_ENCODED_PACKET_SIZE = 64;
    RtpSocket rtpSocket = null;

    /** Sip codec to be used on audio session */
    private Codec sipCodec = null;
    private Decoder decoder;
    private DecoderMap decoderMap;
    private byte[] packetBuffer;

    // Temporary buffer with received PCM audio from FlashPlayer.
    float[] tempBuffer;

    // Floats remaining on temporary buffer.
    int tempBufferRemaining = 0;

    // Encoding buffer used to encode to final codec format;
    float[] encodingBuffer;

    // Offset of encoding buffer.
    int encodingOffset = 0;

    // Indicates whether the current asao buffer was processed.
    boolean asao_buffer_processed = false;

    // Indicates whether the handling buffers have already
    // been initialized.
    boolean hasInitilializedBuffers = false;

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
        byte[] codedBuffer = new byte[ sipCodec.getOutgoingEncodedFrameSize() ];

        try {
            if ((tempBufferRemaining + encodingOffset) >= sipCodec.getOutgoingDecodedFrameSize()) {
                copyingSize = encodingBuffer.length - encodingOffset;

                //BufferUtils.floatBufferIndexedCopy(encodingBuffer, encodingOffset, tempBuffer,
                //        tempBuffer.length - tempBufferRemaining, copyingSize );
                
                System.arraycopy(tempBuffer, tempBuffer.length-tempBufferRemaining, encodingBuffer, encodingOffset, copyingSize);

                encodingOffset = sipCodec.getOutgoingDecodedFrameSize();
                tempBufferRemaining -= copyingSize;
                finalCopySize = sipCodec.getOutgoingDecodedFrameSize();
            }
            else {
                if (tempBufferRemaining > 0) {
                    BufferUtils.floatBufferIndexedCopy(encodingBuffer, encodingOffset, tempBuffer,
                            tempBuffer.length - tempBufferRemaining, tempBufferRemaining );

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

                //println( "fillRtpPacketBuffer",
                //        "Decoded pcm " + tempBuffer.length + " floats." );

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

                BufferUtils.floatBufferIndexedCopy(encodingBuffer, encodingOffset, tempBuffer,
                        						0, copyingSize );

                encodingOffset += copyingSize;
                tempBufferRemaining -= copyingSize;
                finalCopySize += copyingSize;
            }

            if (encodingOffset == encodingBuffer.length)
            {
                int encodedBytes = sipCodec.pcmToCodec( encodingBuffer, codedBuffer );

                if ( encodedBytes == sipCodec.getOutgoingEncodedFrameSize() ) {
                    BufferUtils.byteBufferIndexedCopy(transcodedData, dataOffset, codedBuffer, 0, codedBuffer.length );
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


    public void transcode(byte[] asaoBuffer, int offset, int num, byte[] transcodedData, int dataOffset, RtpSender rtpSender) {  
        asao_buffer_processed = false;

        if ( !hasInitilializedBuffers ) {
            tempBuffer = new float[ NELLYMOSER_DECODED_PACKET_SIZE ];
            encodingBuffer = new float[ sipCodec.getOutgoingDecodedFrameSize() ];
            hasInitilializedBuffers = true;
        }

        if ( num > 0 ) {
            do {
                int encodedBytes = fillRtpPacketBuffer( asaoBuffer, transcodedData, dataOffset );
                //println( "send", sipCodec.getCodecName() + " encoded " + encodedBytes + " bytes." );

                if ( encodedBytes == 0 ) {
                    break;
                }

                if ( encodingOffset == sipCodec.getOutgoingDecodedFrameSize() ) {
                    //println( "send", "Seding packet with " + encodedBytes + " bytes." );
                    try {
                    	rtpSender.sendTranscodedData();
                    }
                    catch ( Exception e ) {
                        log.debug(sipCodec.getCodecName() + " encoder error." );
                    }

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
}
