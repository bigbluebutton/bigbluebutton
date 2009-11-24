package org.red5.app.sip;

import local.net.RtpPacket;
import local.net.RtpSocket;

import java.io.IOException;
import java.net.DatagramSocket;
import org.slf4j.Logger;
import org.red5.app.sip.codecs.Codec;
import org.red5.logging.Red5LoggerFactory;

public class RtpReceiver extends Thread {
    protected static Logger log = Red5LoggerFactory.getLogger( RtpReceiver.class, "sip" );

    private static int RTP_HEADER_SIZE = 12;
    
    // Maximum blocking time, spent waiting for reading new bytes [milliseconds]     
    private static final int SO_TIMEOUT = 200;

    private RtpSocket rtpSocket = null;

    /** Whether the socket has been created here */
    private boolean socketIsLocal = false;

    private volatile boolean running = false;
    private PcmToNellyTranscoder transcoder;
    private RTMPUser rtmpUser;
    private int timestamp = 0;
    
    public RtpReceiver(RTMPUser rtmpUser, PcmToNellyTranscoder transcoder, DatagramSocket socket ) {
    	this.transcoder = transcoder;
        this.rtmpUser = rtmpUser;

        if ( socket != null ) {
            rtpSocket = new RtpSocket( socket );
        }
    }
    
    public boolean isRunning() {
        return running;
    }

    public void halt() {
        running = false;
    }

    public void run() {
        int packetLength = 0;
        int headerOffset = 0;
        int payloadLength = 0;
        int frameCounter = 0;
        
        if ( rtpSocket == null ) {
            log.error( "run", "RTP socket is null." );
            return;
        }
        
        int internalBufferLength = transcoder.getIncomingEncodedFrameSize() + RTP_HEADER_SIZE;
        running = true;

        try {

            rtpSocket.getDatagramSocket().setSoTimeout( SO_TIMEOUT );
            
            while ( running ) {
                try {
                    byte[] internalBuffer = new byte[internalBufferLength];
                    RtpPacket rtpPacket = new RtpPacket(internalBuffer, 0);                	
                    rtpSocket.receive( rtpPacket );
                    frameCounter++;

                    byte[] packetBuffer = rtpPacket.getPacket();
                    headerOffset = rtpPacket.getHeaderLength();
                    payloadLength = rtpPacket.getPayloadLength();
                    packetLength = packetBuffer.length;                        
                    byte[] codedBuffer = new byte[payloadLength];
                        
                    log.debug("pkt.length = " + packetBuffer.length
                                + ", offset = " + headerOffset
                                + ", length = " + payloadLength + "." );

                	System.arraycopy( packetBuffer, headerOffset, codedBuffer, 0, payloadLength);                        
                	transcoder.transcode(codedBuffer, this);                    
                }
                catch ( java.io.InterruptedIOException e ) {
                }
            }
        }
        catch ( Exception e ) {
            running = false;
            log.error("pkt.length = " + packetLength
                         + ", offset = " + headerOffset
                         + ", length = " + payloadLength + "." );
            log.error("Exception - " + e.toString());
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

        log.debug("Terminated." );
        log.debug( "run", "Frames = " + frameCounter + "." );
    }
    
    public void pushAudio( int len, byte[] audio, int codec ) throws IOException {
    	timestamp = timestamp + len;
    	rtmpUser.pushAudio(len, audio, timestamp, codec);
    }
}
