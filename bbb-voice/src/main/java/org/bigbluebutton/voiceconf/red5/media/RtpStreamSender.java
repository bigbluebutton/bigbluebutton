/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.voiceconf.red5.media;

import java.io.IOException;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Random;

import org.slf4j.Logger;
import org.bigbluebutton.voiceconf.red5.media.net.RtpPacket;
import org.bigbluebutton.voiceconf.red5.media.net.RtpSocket;
import org.bigbluebutton.voiceconf.sip.SipConnectInfo;
import org.bigbluebutton.voiceconf.util.StackTraceUtil;
import org.red5.logging.Red5LoggerFactory;

public class RtpStreamSender {
    private static Logger log = Red5LoggerFactory.getLogger(RtpStreamSender.class, "sip");
	
    private static final int RTP_HEADER_SIZE = 12;
    private RtpSocket rtpSocket = null;
    private int sequenceNum = 0;
    private final DatagramSocket srcSocket;
    private final SipConnectInfo connInfo;
    private boolean marked = false;
    private long startTimestamp;
    
    public RtpStreamSender(DatagramSocket srcSocket, SipConnectInfo connInfo)  {     
        this.srcSocket = srcSocket;
        this.connInfo = connInfo;
    }

    public void connect() throws StreamException {
    	try {
			rtpSocket = new RtpSocket(srcSocket, InetAddress.getByName(connInfo.getRemoteAddr()), connInfo.getRemotePort());
	        Random rgen = new Random();
			sequenceNum = rgen.nextInt(1000);  	
		} catch (UnknownHostException e) {
			log.error("Failed to connect to {}", connInfo.getRemoteAddr());
			log.error(StackTraceUtil.getStackTrace(e));
			throw new StreamException("Rtp sender failed to connect to " + connInfo.getRemoteAddr() + ".");
		}    	
    }
    
    public void sendAudio(byte[] audioData, int codecId, long timestamp) {
    	byte[] transcodedAudioDataBuffer = new byte[audioData.length + RTP_HEADER_SIZE];
    	System.arraycopy(audioData, 0, transcodedAudioDataBuffer, RTP_HEADER_SIZE, audioData.length);
    	RtpPacket rtpPacket = new RtpPacket(transcodedAudioDataBuffer, transcodedAudioDataBuffer.length);
    	if (!marked) {
    		rtpPacket.setMarker(true);
    		marked = true;
    		startTimestamp = System.currentTimeMillis();
    	}
    	rtpPacket.setPadding(false);
    	rtpPacket.setExtension(false);
        rtpPacket.setPayloadType(codecId);
    	rtpPacket.setSeqNum(sequenceNum++);   
    	rtpPacket.setTimestamp(timestamp);
        rtpPacket.setPayloadLength(audioData.length);
        try {
			rtpSocketSend(rtpPacket);
		} catch (StreamException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}  
    }
        
    private synchronized void rtpSocketSend(RtpPacket rtpPacket) throws StreamException  {
    	try {
			rtpSocket.send(rtpPacket);
		} catch (IOException e) {
			log.error("Exception while trying to send rtp packet");
			log.error(StackTraceUtil.getStackTrace(e));
			throw new StreamException("Failed to send data to server.");
		}         
    }
}
