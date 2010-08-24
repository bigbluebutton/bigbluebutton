/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.voiceconf.red5.media;

import java.io.IOException;
import java.net.DatagramSocket;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import org.slf4j.Logger;
import org.bigbluebutton.voiceconf.red5.media.net.RtpPacket;
import org.bigbluebutton.voiceconf.red5.media.net.RtpSocket;
import org.red5.logging.Red5LoggerFactory;

public class RtpStreamReceiver {
    protected static Logger log = Red5LoggerFactory.getLogger(RtpStreamReceiver.class, "sip");
    
    // Maximum blocking time, spent waiting for reading new bytes [milliseconds]     
//    private static final int SO_TIMEOUT = 200;
    private static int RTP_HEADER_SIZE = 12;
    private RtpSocket rtpSocket = null;
    private final Executor exec = Executors.newSingleThreadExecutor();
	private Runnable rtpPacketReceiver;
	private volatile boolean receivePackets = false;
	private RtpStreamReceiverListener listener;
    private final int payloadLength;
    private int lastSequenceNumber = 0;
    private long lastPacketTimestamp = 0;
    
    public RtpStreamReceiver(DatagramSocket socket, int expectedPayloadLength) {
    	this.payloadLength = expectedPayloadLength;
        rtpSocket = new RtpSocket(socket);

        initializeSocket();
    }
    
    public void setRtpStreamReceiverListener(RtpStreamReceiverListener listener) {
    	this.listener = listener;
    }
    
    private void initializeSocket() {
/*    	try {
			rtpSocket.getDatagramSocket().setSoTimeout(SO_TIMEOUT);
		} catch (SocketException e1) {
			log.warn("SocketException while setting socket block time.");
		}
*/    }
    
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
        byte[] internalBuffer = new byte[internalBufferLength];
		RtpPacket rtpPacket = new RtpPacket(internalBuffer, internalBufferLength);
		
        while (receivePackets) {
        	try {        		      
        		rtpSocket.receive(rtpPacket);
        		packetReceivedCounter++;  
        		if (rtpPacket.getSeqNum() > lastSequenceNumber) {
        			lastSequenceNumber = rtpPacket.getSeqNum();
        			System.out.println("      RX RTP ts=" + rtpPacket.getTimestamp() + " length=" + rtpPacket.getPayload().length);
        			AudioByteData audioData = new AudioByteData(rtpPacket.getPayload());
            		if (listener != null) listener.onAudioDataReceived(audioData);
            		else log.debug("No listener for incoming audio packet");
        		} else {
        			System.out.println("SequenceNumber < lastSequence (" + rtpPacket.getSeqNum() + " < " + lastSequenceNumber + ")");
        		}
        	} catch (IOException e) {
        		// We get this when the socket closes when the call hangs up.
        		receivePackets = false;
        	}
        }
        log.debug("Rtp Receiver stopped." );
        log.debug("Packet Received = " + packetReceivedCounter + "." );
        if (listener != null) listener.onStoppedReceiving();
    }
}
