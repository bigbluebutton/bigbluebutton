package org.red5.app.sip.stream;

import local.net.RtpPacket;
import local.net.RtpSocket;
import java.io.IOException;
import java.net.DatagramSocket;
import java.net.SocketException;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

public class RtpStreamReceiver {
    protected static Logger log = Red5LoggerFactory.getLogger(RtpStreamReceiver.class, "sip");
    
    // Maximum blocking time, spent waiting for reading new bytes [milliseconds]     
    private static final int SO_TIMEOUT = 200;
    private static int RTP_HEADER_SIZE = 12;
    private RtpSocket rtpSocket = null;
    private final Executor exec = Executors.newSingleThreadExecutor();
	private Runnable rtpPacketReceiver;
	private volatile boolean receivePackets = false;
	
    private ReceivedRtpPacketProcessor packetProcessor;
    private RtpStreamReceiverListener listener;
    private final int payloadLength;
    
    public RtpStreamReceiver(ReceivedRtpPacketProcessor packetProcessor, DatagramSocket socket, int payloadLength) {
    	this.packetProcessor = packetProcessor;
    	this.payloadLength = payloadLength;
        rtpSocket = new RtpSocket(socket);
    }
    
    public void setRtpStreamReceiverListener(RtpStreamReceiverListener listener) {
    	this.listener = listener;
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

        int packetReceivedCounter = 0;
        int internalBufferLength = payloadLength + RTP_HEADER_SIZE;
        
        while (receivePackets) {
        	try {
        		byte[] internalBuffer = new byte[internalBufferLength];
        		RtpPacket rtpPacket = new RtpPacket(internalBuffer, 0);                	
        		rtpSocket.receive(rtpPacket);
        		packetReceivedCounter++;   
        		processReceivedPacket(rtpPacket);
        	} catch (IOException e) {
        		log.error("IOException while receiving rtp packets.");
        		receivePackets = false;
        	}
        }

        closeSocket();

        log.debug("Rtp Receiver stopped." );
        log.debug("Packet Received = " + packetReceivedCounter + "." );
    }
    
    private void processReceivedPacket(RtpPacket rtpPacket) {
/*
    	int headerOffset = 0;
        int payloadLength = 0;    	

		byte[] packetBuffer = rtpPacket.getPacket();
		headerOffset = rtpPacket.getHeaderLength();
		payloadLength = rtpPacket.getPayloadLength();                      
		byte[] codedBuffer = new byte[payloadLength];
*/

//		System.out.println("pkt.length = " + rtpPacket.getPayloadLength()
//                        + ", offset = " + rtpPacket.getHeaderLength()
//                        + ", length = " + rtpPacket.getPayloadLength() + "." );

//		System.arraycopy(packetBuffer, headerOffset, codedBuffer, 0, payloadLength);
//    	transcoder.transcode(codedBuffer);
    	
//    	byte[] payload = rtpPacket.getPayload();
		try {
			packetProcessor.process(rtpPacket);
		} catch (InterruptedException e) {
			log.error("InterruptedException while attempting to process received Rtp packet");
		}      	
    }
    
    private void closeSocket() {
        rtpSocket.close(); 	
        if (listener != null) {
        	listener.onStoppedReceiving();
        }
    }
}
