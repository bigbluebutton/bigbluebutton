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

import local.net.RtpPacket;
import local.net.RtpSocket;
import java.io.IOException;
import java.net.DatagramSocket;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import org.slf4j.Logger;
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
        
        while (receivePackets) {
        	try {
        		byte[] internalBuffer = new byte[internalBufferLength];
        		RtpPacket rtpPacket = new RtpPacket(internalBuffer, 0);      
        		System.out.println("Waiting for RTP packet [" + rtpPacket.getLength() + "," + rtpPacket.getPayloadLength() + "," + internalBufferLength + "]");
        		rtpSocket.receive(rtpPacket);
        		packetReceivedCounter++;   
        		System.out.println("Received RTP packet [" + rtpPacket.getLength() + "," + rtpPacket.getPayloadLength() + "]");
        		if (listener != null) listener.onAudioDataReceived(rtpPacket.getPayload());
        		else log.debug("No listener for incoming audio packet");
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
