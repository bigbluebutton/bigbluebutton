package org.red5.server.webapp.sip;


import local.net.RtpPacket;
import local.net.RtpSocket;

import java.net.InetAddress;
import java.net.DatagramSocket;

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

import org.red5.app.sip.codecs.SIPCodec;
import org.red5.app.sip.codecs.asao.ByteStream;
import org.red5.app.sip.codecs.asao.Decoder;
import org.red5.app.sip.codecs.asao.DecoderMap;
import org.red5.codecs.asao.*;


public class RTPStreamSender {

    protected static Logger log = Red5LoggerFactory.getLogger( RTPStreamSender.class, "sip" );

    public static int RTP_HEADER_SIZE = 12;
    private static final int NELLYMOSER_DECODED_PACKET_SIZE = 256;
    private static final int NELLYMOSER_ENCODED_PACKET_SIZE = 64;
    RtpSocket rtpSocket = null;

    /** Sip codec to be used on audio session */
    private SIPCodec sipCodec = null;
    boolean socketIsLocal = false;
    boolean doSync = true;
    private int syncAdj = 0;
    private Decoder decoder;
    private DecoderMap decoderMap;
    private byte[] packetBuffer;
    private RtpPacket rtpPacket;
    private int startPayloadPos;
    private int dtmf2833Type = 101;
    private int seqn = 0;
    private long time = 0;

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


    /**
     * Constructs a RtpStreamSender.
     *
     * @param RTMPUser
     *            the RTMP stream source
     * @param do_sync
     *            whether time synchronization must be performed by the
     *            RtpStreamSender, or it is performed by the InputStream (e.g.
     *            the system audio input)
     * @param sipCodec
     *            codec to be used on audio session
     * @param dest_addr
     *            the destination address
     * @param dest_port
     *            the destination port
     */

    public RTPStreamSender(RTMPUser rtmpUser, boolean do_sync, SIPCodec sipCodec,
    			String dest_addr, int dest_port ) {
        init( rtmpUser, do_sync, sipCodec, null, dest_addr, dest_port );
    }


    /**
     * Constructs a RtpStreamSender.
     *
     * @param RTMPUser
     *            the RTMP stream source
     * @param do_sync
     *            whether time synchronization must be performed by the
     *            RtpStreamSender, or it is performed by the InputStream (e.g.
     *            the system audio input)
     * @param sipCodec
     *            codec to be used on audio session
     * @param src_port
     *            the source port
     * @param dest_addr
     *            the destination address
     * @param dest_port
     *            the destination port
     */
    // public RtpStreamSender(RTMPUser rtmpUser, boolean do_sync, int
    // payloadType, long frame_rate, int frame_size, int src_port, String
    // dest_addr, int dest_port)
    // {
    // init( rtmpUser, do_sync, payloadType, frame_rate, frame_size, null, src_port, dest_addr, dest_port);
    // }
    /**
     * Constructs a RtpStreamSender.
     *
     * @param RTMPUser
     *            the RTMP stream source
     * @param do_sync
     *            whether time synchronization must be performed by the
     *            RtpStreamSender, or it is performed by the InputStream (e.g.
     *            the system audio input)
     * @param sipCodec
     *            codec to be used on audio session
     * @param src_socket
     *            the socket used to send the RTP packet
     * @param dest_addr
     *            the destination address
     * @param dest_port
     *            the thestination port
     */
    public RTPStreamSender( RTMPUser rtmpUser, boolean do_sync, SIPCodec sipCodec,
        DatagramSocket src_socket, String dest_addr, int dest_port ) {
        init( rtmpUser, do_sync, sipCodec, src_socket, dest_addr, dest_port );
    }


    /** Inits the RtpStreamSender */
    private void init(RTMPUser rtmpUser, boolean do_sync, SIPCodec sipCodec,
    					DatagramSocket src_socket, String dest_addr, int dest_port ) {
        rtmpUser.rtpStreamSender = this;
        this.sipCodec = sipCodec;
        this.doSync = do_sync;

        try {
            if ( src_socket == null ) {

                src_socket = new DatagramSocket();
                socketIsLocal = true;
            }

            rtpSocket = new RtpSocket( src_socket, InetAddress.getByName( dest_addr ), dest_port );
        }
        catch ( Exception e ) {
            e.printStackTrace();
        }
    }


    /** Sets the synchronization adjustment time (in milliseconds). */
    public void setSyncAdj( int millisecs ) {

        syncAdj = millisecs;
    }


    public void start() {
        packetBuffer = new byte[ sipCodec.getOutgoingEncodedFrameSize() + RTP_HEADER_SIZE ];
        rtpPacket = new RtpPacket( packetBuffer, 0 );
        rtpPacket.setPayloadType( sipCodec.getCodecId() );
        startPayloadPos = rtpPacket.getHeaderLength();

        seqn = 0;
        time = 0;

        println( "start()", "using blocks of " + ( packetBuffer.length - RTP_HEADER_SIZE ) + " bytes." );

        decoder = new Decoder();
        decoderMap = null;
    }


    public void queueSipDtmfDigits( String argDigits ) {

        byte[] dtmfbuf = new byte[ sipCodec.getOutgoingEncodedFrameSize() + RTP_HEADER_SIZE ];
        RtpPacket dtmfpacket = new RtpPacket( dtmfbuf, 0 );
        dtmfpacket.setPayloadType( dtmf2833Type );
        dtmfpacket.setPayloadLength( sipCodec.getOutgoingEncodedFrameSize() );

        byte[] blankbuf = new byte[ sipCodec.getOutgoingEncodedFrameSize() + RTP_HEADER_SIZE ];
        RtpPacket blankpacket = new RtpPacket( blankbuf, 0 );
        blankpacket.setPayloadType( sipCodec.getCodecId() );
        blankpacket.setPayloadLength( sipCodec.getOutgoingEncodedFrameSize() );

        for ( int d = 0; d < argDigits.length(); d++ ) {

            char digit = argDigits.charAt( d );

            if ( digit == '*' ) {
                dtmfbuf[ startPayloadPos ] = 10;
            }
            else if ( digit == '#' ) {
                dtmfbuf[ startPayloadPos ] = 11;
            }
            else if ( digit >= 'A' && digit <= 'D' ) {
                dtmfbuf[ startPayloadPos ] = (byte) ( digit - 53 );
            }
            else {
                dtmfbuf[ startPayloadPos ] = (byte) ( digit - 48 );
            }

            //println( "queueSipDtmfDigits", "Sending digit:" + dtmfbuf[ startPayloadPos ] );

            // notice we are bumping times/seqn just like audio packets

            try {
                // send start event packet 3 times
                dtmfbuf[ startPayloadPos + 1 ] = 0; // start event flag
                // and volume
                dtmfbuf[ startPayloadPos + 2 ] = 1; // duration 8 bits
                dtmfbuf[ startPayloadPos + 3 ] = -32; // duration 8 bits

                for ( int r = 0; r < 3; r++ ) {
                    dtmfpacket.setSequenceNumber( seqn++ );
                    dtmfpacket.setTimestamp( sipCodec.getOutgoingEncodedFrameSize() );
                    doRtpDelay();
                    rtpSocketSend( dtmfpacket );
                }

                // send end event packet 3 times
                dtmfbuf[ startPayloadPos + 1 ] = -128; // end event flag
                dtmfbuf[ startPayloadPos + 2 ] = 3; // duration 8 bits
                dtmfbuf[ startPayloadPos + 3 ] = 116; // duration 8 bits
                for ( int r = 0; r < 3; r++ ) {
                    dtmfpacket.setSequenceNumber( seqn++ );
                    dtmfpacket.setTimestamp(sipCodec.getOutgoingEncodedFrameSize() );
                    doRtpDelay();
                    rtpSocketSend( dtmfpacket );
                }

                // send 200 ms of blank packets
                for ( int r = 0; r < 200 / sipCodec.getOutgoingPacketization(); r++ ) {
                    blankpacket.setSequenceNumber( seqn++ );
                    blankpacket.setTimestamp(sipCodec.getOutgoingEncodedFrameSize() );
                    doRtpDelay();
                    rtpSocketSend( blankpacket );
                }

            }
            catch ( Exception e ) {
                println( "queueSipDtmfDigits", e.getLocalizedMessage() );
            }
        }
    }



    /** Fill the buffer of RtpPacket with necessary data. */
    private int fillRtpPacketBuffer(byte[] asaoBuffer) {

        int copyingSize = 0;
        int finalCopySize = 0;
        byte[] codedBuffer = new byte[ sipCodec.getOutgoingEncodedFrameSize() ];

        try {
            //println( "fillRtpPacketBuffer",
            //        "packetBuffer.length = " + packetBuffer.length
            //        + ", asaoBuffer.length = " + asaoBuffer.length
            //        + ", tempBuffer.length = " + tempBuffer.length
            //        + ", encodingOffset = " + encodingOffset
            //        + ", tempBufferRemaining = " + tempBufferRemaining + "." );

            if ( ( tempBufferRemaining + encodingOffset ) >= sipCodec.getOutgoingDecodedFrameSize() ) {

                copyingSize = encodingBuffer.length - encodingOffset;

                BufferUtils.floatBufferIndexedCopy(
                        encodingBuffer,
                        encodingOffset,
                        tempBuffer,
                        tempBuffer.length - tempBufferRemaining,
                        copyingSize );

                encodingOffset = sipCodec.getOutgoingDecodedFrameSize();
                tempBufferRemaining -= copyingSize;
                finalCopySize = sipCodec.getOutgoingDecodedFrameSize();

                //println( "fillRtpPacketBuffer", "Simple copy of " + copyingSize + " bytes." );
            }
            else {
                if ( tempBufferRemaining > 0 ) {
                    BufferUtils.floatBufferIndexedCopy(
                            encodingBuffer,
                            encodingOffset,
                            tempBuffer,
                            tempBuffer.length - tempBufferRemaining,
                            tempBufferRemaining );

                    encodingOffset += tempBufferRemaining;
                    finalCopySize += tempBufferRemaining;
                    tempBufferRemaining = 0;

                    //println( "fillRtpPacketBuffer",
                    //        "tempBufferRemaining copied -> "
                    //        + "encodingOffset = " + encodingOffset
                    //        + ", tempBufferRemaining = " + tempBufferRemaining + "." );
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

                    println( "fillRtpPacketBuffer", "Asao decoder Error." );
                }

                // Try to complete the encodingBuffer with necessary data.

                //println( "fillRtpPacketBuffer",
                //        "New buffer processed -> "
                //        + "finalCopySize = " + finalCopySize
                //        + ", encodingOffset = " + encodingOffset
                //        + ", tempBufferRemaining = " + tempBufferRemaining + "." );

                if ( ( encodingOffset + tempBufferRemaining ) > sipCodec.getOutgoingDecodedFrameSize() ) {
                    copyingSize = encodingBuffer.length - encodingOffset;
                }
                else {
                    copyingSize = tempBufferRemaining;
                }

                //println( "fillRtpPacketBuffer", "CopyingSize = " + copyingSize + "." );

                BufferUtils.floatBufferIndexedCopy(
                        encodingBuffer,
                        encodingOffset,
                        tempBuffer,
                        0,
                        copyingSize );

                encodingOffset += copyingSize;
                tempBufferRemaining -= copyingSize;
                finalCopySize += copyingSize;
            }

            if (encodingOffset == encodingBuffer.length)
            {
 //               isBufferFilled = true;

                int encodedBytes = sipCodec.pcmToCodec( encodingBuffer, codedBuffer );

                //println( "fillRtpPacketBuffer",
                //        "encodedBytes = " + encodedBytes +
                //        ", outgoingEncodedFrameSize = " + sipCodec.getOutgoingEncodedFrameSize() + "." );

                if ( encodedBytes == sipCodec.getOutgoingEncodedFrameSize() ) {

                    BufferUtils.byteBufferIndexedCopy( packetBuffer,
                            RTP_HEADER_SIZE, codedBuffer, 0, codedBuffer.length );
                }
                else {
                    //println( "fillRtpPacketBuffer", "Failure encoding buffer." );
                }
            }

            //println( "fillRtpPacketBuffer",
            //        "finalCopySize = " + finalCopySize
            //        + ", isBufferFilled = " + isBufferFilled
            //        + ", encodingOffset = " + encodingOffset
            //        + ", tempBufferRemaining = " + tempBufferRemaining + "." );
        }
        catch ( Exception e ) {
        	
        	println("Exception - ", e.toString());
        	
            e.printStackTrace();
        }

        return finalCopySize;
    }


    public void send( byte[] asaoBuffer, int offset, int num ) {

        if ( rtpSocket == null ) {
            return;
        }

        asao_buffer_processed = false;

        if ( !hasInitilializedBuffers ) {

            tempBuffer = new float[ NELLYMOSER_DECODED_PACKET_SIZE ];
            encodingBuffer = new float[ sipCodec.getOutgoingDecodedFrameSize() ];

            hasInitilializedBuffers = true;
        }

        //println( "send",
        //        "asaoBuffer.length = [" + asaoBuffer.length + "], offset = ["
        //        + offset + "], num = [" + num + "]." );

        if ( num > 0 ) {

            do {

                int encodedBytes = fillRtpPacketBuffer( asaoBuffer );

                //println( "send", sipCodec.getCodecName() + " encoded " + encodedBytes + " bytes." );

                if ( encodedBytes == 0 ) {

                    break;
                }

                if ( encodingOffset == sipCodec.getOutgoingDecodedFrameSize() ) {

                    //println( "send", "Seding packet with " + encodedBytes + " bytes." );

                    try {

                        rtpPacket.setSequenceNumber( seqn++ );
                        rtpPacket.setTimestamp( time );
                        rtpPacket.setPayloadLength( sipCodec.getOutgoingEncodedFrameSize() );
                        rtpSocketSend( rtpPacket );
                    }
                    catch ( Exception e ) {
                        println( "send", sipCodec.getCodecName() + " encoder error." );
                    }

                    encodingOffset = 0;
                }

                //println( "send", "asao_buffer_processed = ["
                //        + asao_buffer_processed + "] ." );
            }
            while ( !asao_buffer_processed );
        }
        else if ( num < 0 ) {
            println( "send", "Closing" );
        }
    }


    public void halt() {

        DatagramSocket socket = rtpSocket.getDatagramSocket();

        rtpSocket.close();

        if ( socketIsLocal && socket != null ) {
            socket.close();
        }

        rtpSocket = null;

        println( "halt", "Terminated" );
    }


    private void doRtpDelay() {

        try {
            Thread.sleep( sipCodec.getOutgoingPacketization() - 2 );
        }
        catch ( Exception e ) {
        }
    }


    private synchronized void rtpSocketSend(RtpPacket rtpPacket) {

        try {
         	rtpSocket.send( rtpPacket );
            time += rtpPacket.getPayloadLength();
        }
        catch ( Exception e ) {
        }
    }

    private static void println( String method, String message ) {

        log.debug( "RTPStreamSender - " + method + " -> " + message );
        System.out.println( "RTPStreamSender - " + method + " -> " + message );
    }



}
