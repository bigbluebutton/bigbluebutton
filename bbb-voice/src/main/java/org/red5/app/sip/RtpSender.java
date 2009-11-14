package org.red5.app.sip;

import local.net.RtpPacket;
import local.net.RtpSocket;
import java.net.InetAddress;
import java.net.DatagramSocket;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

public class RtpSender {
    protected static Logger log = Red5LoggerFactory.getLogger( RtpSender.class, "sip" );

    public static int RTP_HEADER_SIZE = 12;
    RtpSocket rtpSocket = null;

    boolean socketIsLocal = false;
    boolean doSync = true;
    private int syncAdj = 0;
    private byte[] packetBuffer;
    private RtpPacket rtpPacket;
    private int startPayloadPos;
    private int dtmf2833Type = 101;
    private int seqn = 0;
    private long time = 0;
    private NellyToPcmTranscoder transcoder;
    
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
    public RtpSender(NellyToPcmTranscoder transcoder, boolean do_sync, DatagramSocket src_socket, String dest_addr, int dest_port ) {
        this.transcoder = transcoder;
    	init(  do_sync, src_socket, dest_addr, dest_port );
    }

    private void init(boolean do_sync, DatagramSocket src_socket, String dest_addr, int dest_port ) {
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
        packetBuffer = new byte[ transcoder.getOutgoingEncodedFrameSize() + RTP_HEADER_SIZE ];
        rtpPacket = new RtpPacket( packetBuffer, 0 );
        rtpPacket.setPayloadType( transcoder.getCodecId() );
        startPayloadPos = rtpPacket.getHeaderLength();

        seqn = 0;
        time = 0;

        println( "start()", "using blocks of " + ( packetBuffer.length - RTP_HEADER_SIZE ) + " bytes." );
    }


    public void queueSipDtmfDigits( String argDigits ) {
        byte[] dtmfbuf = new byte[ transcoder.getOutgoingEncodedFrameSize() + RTP_HEADER_SIZE ];
        RtpPacket dtmfpacket = new RtpPacket( dtmfbuf, 0 );
        dtmfpacket.setPayloadType( dtmf2833Type );
        dtmfpacket.setPayloadLength( transcoder.getOutgoingEncodedFrameSize() );

        byte[] blankbuf = new byte[ transcoder.getOutgoingEncodedFrameSize() + RTP_HEADER_SIZE ];
        RtpPacket blankpacket = new RtpPacket( blankbuf, 0 );
        blankpacket.setPayloadType( transcoder.getCodecId() );
        blankpacket.setPayloadLength( transcoder.getOutgoingEncodedFrameSize() );

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
                    dtmfpacket.setTimestamp( transcoder.getOutgoingEncodedFrameSize() );
                    doRtpDelay();
                    rtpSocketSend( dtmfpacket );
                }

                // send end event packet 3 times
                dtmfbuf[ startPayloadPos + 1 ] = -128; // end event flag
                dtmfbuf[ startPayloadPos + 2 ] = 3; // duration 8 bits
                dtmfbuf[ startPayloadPos + 3 ] = 116; // duration 8 bits
                for ( int r = 0; r < 3; r++ ) {
                    dtmfpacket.setSequenceNumber( seqn++ );
                    dtmfpacket.setTimestamp(transcoder.getOutgoingEncodedFrameSize() );
                    doRtpDelay();
                    rtpSocketSend( dtmfpacket );
                }

                // send 200 ms of blank packets
                for ( int r = 0; r < 200 / transcoder.getOutgoingPacketization(); r++ ) {
                    blankpacket.setSequenceNumber( seqn++ );
                    blankpacket.setTimestamp(transcoder.getOutgoingEncodedFrameSize() );
                    doRtpDelay();
                    rtpSocketSend( blankpacket );
                }

            }
            catch ( Exception e ) {
                println( "queueSipDtmfDigits", e.getLocalizedMessage() );
            }
        }
    }

    public void send( byte[] asaoBuffer, int offset, int num ) {
    	transcoder.transcode(asaoBuffer, offset, num, packetBuffer, RTP_HEADER_SIZE, this);
    }
    
    public void sendTranscodedData() {
        rtpPacket.setSequenceNumber( seqn++ );
        rtpPacket.setTimestamp( time );
        rtpPacket.setPayloadLength( transcoder.getOutgoingEncodedFrameSize() );
        rtpSocketSend( rtpPacket );    	
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
            Thread.sleep( transcoder.getOutgoingPacketization() - 2 );
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
