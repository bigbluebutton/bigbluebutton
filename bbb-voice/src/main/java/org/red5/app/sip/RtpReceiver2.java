package org.red5.app.sip;

import local.net.RtpPacket;
import local.net.RtpSocket;

import java.io.IOException;
import java.net.DatagramSocket;
import java.net.SocketException;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

public class RtpReceiver2 {
    protected static Logger log = Red5LoggerFactory.getLogger(RtpReceiver2.class, "sip");
    
    // Maximum blocking time, spent waiting for reading new bytes [milliseconds]     
    private static final int SO_TIMEOUT = 200;
    private static int RTP_HEADER_SIZE = 12;
    private RtpSocket rtpSocket = null;

    /** Whether the socket has been created here */
    private boolean socketIsLocal = false;

    private final Executor exec = Executors.newSingleThreadExecutor();
	private Runnable rtpPacketReceiver;
	private volatile boolean receivePackets = false;
	
    private PcmToNellyTranscoder2 transcoder;

    public RtpReceiver2(PcmToNellyTranscoder2 transcoder, DatagramSocket socket) {
    	this.transcoder = transcoder;
        if (socket != null) {
            rtpSocket = new RtpSocket(socket);
        }

        initializeSocket();
    }
    
    private void initializeSocket() {
    	try {
			rtpSocket.getDatagramSocket().setSoTimeout(SO_TIMEOUT);
		} catch (SocketException e1) {
			log.warn("SocketException while setting socket block time.");
		}
    }
    
    public void start() {
    	receivePackets = true;
    	rtpPacketReceiver = new Runnable() {
    		public void run() {
    			receiveRtpPackets();   			
    		}
    	};
    	exec.execute(rtpPacketReceiver);
    }
    
    public void stop() {
    	receivePackets = false;
    }
    
    public void receiveRtpPackets() {    
        int packetLength = 0;
        int headerOffset = 0;
        int payloadLength = 0;
        int packetReceivedCounter = 0;
        int internalBufferLength = transcoder.getIncomingEncodedFrameSize() + RTP_HEADER_SIZE;
        
        while (receivePackets) {
        	try {
        		byte[] internalBuffer = new byte[internalBufferLength];
        		RtpPacket rtpPacket = new RtpPacket(internalBuffer, 0);                	
        		rtpSocket.receive(rtpPacket);
        		packetReceivedCounter++;

        		byte[] packetBuffer = rtpPacket.getPacket();
        		headerOffset = rtpPacket.getHeaderLength();
        		payloadLength = rtpPacket.getPayloadLength();
        		packetLength = packetBuffer.length;                        
        		byte[] codedBuffer = new byte[payloadLength];
                        
        		log.debug("pkt.length = " + packetLength
                                + ", offset = " + headerOffset
                                + ", length = " + payloadLength + "." );

        		System.arraycopy(packetBuffer, headerOffset, codedBuffer, 0, payloadLength);                        
                transcoder.transcode(codedBuffer);                    
        	}	catch (IOException e) {
        		log.error("IOException while receiving rtp packets.");
        	}
        }

        closeSocket();

        log.debug("Rtp Receiver stopped." );
        log.debug("Packet Received = " + packetReceivedCounter + "." );
    }
    
    private void closeSocket() {
        // Close RtpSocket and local DatagramSocket.
        DatagramSocket socket = rtpSocket.getDatagramSocket();
        rtpSocket.close();

        if (socketIsLocal && socket != null) {
            socket.close();
        }

        rtpSocket = null;    	
    }
}
