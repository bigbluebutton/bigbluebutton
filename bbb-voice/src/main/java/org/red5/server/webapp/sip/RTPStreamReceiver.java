package org.red5.server.webapp.sip;


import local.net.RtpPacket;
import local.net.RtpSocket;

import java.net.DatagramSocket;

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

import org.red5.codecs.SIPCodec;
import org.red5.codecs.asao.*;


public class RTPStreamReceiver extends Thread {

    protected static Logger log = Red5LoggerFactory.getLogger( RTPStreamReceiver.class, "sip" );

    public static int RTP_HEADER_SIZE = 12;

    private static final int NELLYMOSER_DECODED_PACKET_SIZE = 256;

    private static final int NELLYMOSER_ENCODED_PACKET_SIZE = 64;

    private Encoder encoder;

   	private float[] encoderMap;

    /**
     * Maximum blocking time, spent waiting for reading new bytes [milliseconds]
     */
    public static final int SO_TIMEOUT = 200;

    /** Sip codec to be used on audio session */
    private SIPCodec sipCodec = null;

    /** The RTMPUser */
    RTMPUser rtmpUser = null;

    /** The RtpSocket */
    RtpSocket rtpSocket = null;

    /** Whether the socket has been created here */
    boolean socketIsLocal = false;

    /** Whether it is running */
    boolean running = false;

    int timeStamp = 0;

    int frameCounter = 0;

    // Temporary buffer with PCM audio to be sent to FlashPlayer.
    float[] tempBuffer;

    // Offset of tempBuffer.
    int tempBufferOffset = 0;


    /**
     * Constructs a RtpStreamReceiver.
     *
     * @param sipCodec
     *            codec to be used on audio session
     * @param rtmpUser
     *            the stream sink
     * @param local_port
     *            the local receiver port
     */
    public RTPStreamReceiver( SIPCodec sipCodec, RTMPUser rtmpUser, int local_port ) {

        try {
            DatagramSocket socket = new DatagramSocket( local_port );

            socketIsLocal = true;

            init( sipCodec, rtmpUser, socket );
        }
        catch ( Exception e ) {
            e.printStackTrace();
        }
    }


    /**
     * Constructs a RtpStreamReceiver.
     *
     * @param sipCodec
     *            codec to be used on audio session
     * @param rtmpUser
     *            the stream sink
     * @param socket
     *            the local receiver DatagramSocket
     */
    public RTPStreamReceiver( SIPCodec sipCodec, RTMPUser rtmpUser, DatagramSocket socket ) {

        init( sipCodec, rtmpUser, socket );
    }


    /** Inits the RtpStreamReceiver */
    private void init( SIPCodec sipCodec, RTMPUser rtmpUser, DatagramSocket socket ) {

        this.sipCodec = sipCodec;
        this.rtmpUser = rtmpUser;

        if ( socket != null ) {
            rtpSocket = new RtpSocket( socket );
        }
    }


    /** Whether is running */
    public boolean isRunning() {

        return running;
    }


    /** Stops running */
    public void halt() {

        running = false;
    }


    /**
     * Fills the tempBuffer with necessary PCM's floats and encodes
     * the audio to be sent to FlashPlayer.
     */
    void forwardAudioToFlashPlayer(float[] pcmBuffer) {

        int pcmBufferOffset = 0;
        int copySize = 0;
        boolean pcmBufferProcessed = false;

        do {
            //println( "forwardAudioToFlashPlayer",
            //        "tempBuffer.length = " + tempBuffer.length
            //        + ", tempBufferOffset = " + tempBufferOffset
            //        + ", pcmBuffer.length = " + pcmBuffer.length
            //        + ", pcmBufferOffset = " + pcmBufferOffset + "." );

            if ( ( tempBuffer.length - tempBufferOffset ) <=
                    ( pcmBuffer.length - pcmBufferOffset ) ) {

                copySize = tempBuffer.length - tempBufferOffset;
            }
            else {

                copySize = pcmBuffer.length - pcmBufferOffset;
            }

            //println( "forwardAudioToFlashPlayer", "copySize = " + copySize + "." );

            BufferUtils.floatBufferIndexedCopy(
                    tempBuffer,
                    tempBufferOffset,
                    pcmBuffer,
                    pcmBufferOffset,
                    copySize );

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

                    if ( true ) {

						encoderMap = CodecImpl.encode(encoderMap, tempBuffer, encodedStream.bytes);
						rtmpUser.pushAudio(NELLYMOSER_ENCODED_PACKET_SIZE, encodedStream.bytes, timeStamp, 82);
                    }
                    else {

                        byte[] aux = ResampleUtils.resample(
                                (float) ( 8.0 / 11.025 ), tempBuffer );

                        rtmpUser.pushAudio( aux.length, aux, timeStamp, 6 );
                    }
                }
                catch ( Exception exception ) {
                    println( "forwardAudioToFlashPlayer", "asao Encoder Error." );
                }

                timeStamp = timeStamp + NELLYMOSER_ENCODED_PACKET_SIZE;

                //println( "forwardAudioToFlashPlayer", "Encoded asao " +
                //        NELLYMOSER_DECODED_PACKET_SIZE + " bytes." );

                tempBufferOffset = 0;
            }

            if ( pcmBufferOffset == pcmBuffer.length ) {

                pcmBufferProcessed = true;
            }

            //println( "forwardAudioToFlashPlayer",
            //        "pcmBufferProcessed = " + pcmBufferProcessed + "." );
        }
        while ( !pcmBufferProcessed );
    }


    /** Runs it in a new Thread. */
    public void run() {

        if ( rtpSocket == null ) {
            println( "run", "RTP socket is null." );
            return;
        }

        encoder = new Encoder();
      	encoderMap = new float[64];

        tempBuffer = new float[ NELLYMOSER_DECODED_PACKET_SIZE ];

        byte[] codedBuffer = new byte[ sipCodec.getIncomingEncodedFrameSize() ];
        byte[] internalBuffer = new byte[
                sipCodec.getIncomingEncodedFrameSize() + RTP_HEADER_SIZE ];

        RtpPacket rtpPacket = new RtpPacket( internalBuffer, 0 );

        running = true;

        try {

            rtpSocket.getDatagramSocket().setSoTimeout( SO_TIMEOUT );

            float[] decodingBuffer = new float[ sipCodec.getIncomingDecodedFrameSize() ];
            int packetCount = 0;

            println( "run",
                    "internalBuffer.length = " + internalBuffer.length
                    + ", codedBuffer.length = " + codedBuffer.length
                    + ", decodingBuffer.length = " + decodingBuffer.length + "." );

            while ( running ) {

                try {
                    rtpSocket.receive( rtpPacket );
                    frameCounter++;

                    if ( running ) {

                        byte[] packetBuffer = rtpPacket.getPacket();
                        int offset = rtpPacket.getHeaderLength();
                        int length = rtpPacket.getPayloadLength();

                        //println( "run",
                        //        "pkt.length = " + packetBuffer.length
                        //        + ", offset = " + offset
                        //        + ", length = " + length + "." );

                        BufferUtils.byteBufferIndexedCopy(
                                codedBuffer,
                                0,
                                packetBuffer,
                                offset,
                                sipCodec.getIncomingEncodedFrameSize() );

                        int decodedBytes = sipCodec.codecToPcm( codedBuffer, decodingBuffer );

                        //println( "run",
                        //        "encodedBytes = " + decodedBytes +
                        //        ", incomingDecodedFrameSize = " +
                        //        sipCodec.getIncomingDecodedFrameSize() + "." );

                        if ( decodedBytes == sipCodec.getIncomingDecodedFrameSize() ) {

                            forwardAudioToFlashPlayer( decodingBuffer );
                        }
                        else {
                            println( "fillRtpPacketBuffer", "Failure decoding buffer." );
                        }
                    }
                }
                catch ( java.io.InterruptedIOException e ) {
                }
            }
        }
        catch ( Exception e ) {

            running = false;
            e.printStackTrace();
        }

        // Close RtpSocket and local DatagramSocket.
        DatagramSocket socket = rtpSocket.getDatagramSocket();
        rtpSocket.close();

        if ( socketIsLocal && socket != null ) {
            socket.close();
        }

        // Free all.
        rtpSocket = null;

        println( "run", "Terminated." );
        println( "run", "Frames = " + frameCounter + "." );
    }


    /** Debug output */
    private static void println( String method, String message ) {

        log.debug( "RtpStreamReceiver - " + method + " -> " + message );
        System.out.println( "RtpStreamReceiver - " + method + " -> " + message );
    }
}
