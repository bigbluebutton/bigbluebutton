/** 
*
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
**/
package org.bigbluebutton.voiceconf.sip;

import java.io.IOException;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Random;
import org.bigbluebutton.voiceconf.red5.media.*;
import org.slf4j.Logger;
import org.bigbluebutton.voiceconf.red5.media.net.RtpPacket;
import org.bigbluebutton.voiceconf.red5.media.net.RtpSocket;
import org.bigbluebutton.voiceconf.sip.SipConnectInfo;
import org.bigbluebutton.voiceconf.util.StackTraceUtil;
import org.red5.logging.Red5LoggerFactory;
import java.lang.InterruptedException;


public class KeepGlobalAudioAlive extends Thread {
    // Time is in milliseconds
    // This time should be less than rtp-timeout-sec to prevent freeswitch from kicking out
    // the global audio
    private static final long DELTA_TIME_TO_SEND_KEEPALIVE = 60000;

    private static final int RTP_HEADER_SIZE = 12;
    private RtpSocket rtpSocket = null;
    private int sequenceNum = 0;
    private final DatagramSocket srcSocket;
    private final SipConnectInfo connInfo;
    private boolean marked = false;
    private long startTimestamp = 0;
    boolean stop=false;
    int codecId;
    private static Logger log = Red5LoggerFactory.getLogger(KeepGlobalAudioAlive.class, "sip");

    
    public KeepGlobalAudioAlive(DatagramSocket srcSocket, SipConnectInfo connInfo, int codecId)  {     
        this.srcSocket = srcSocket;
        this.connInfo = connInfo;
	this.codecId = codecId;
	
	connect();
    }

    public void connect() {
    		try {
			rtpSocket = new RtpSocket(srcSocket, InetAddress.getByName(connInfo.getRemoteAddr()), connInfo.getRemotePort());
	        	Random rgen = new Random();
			sequenceNum = rgen.nextInt();  	
		} catch (UnknownHostException e) {
			log.error("Failed to connect to {}", connInfo.getRemoteAddr());
			log.error(StackTraceUtil.getStackTrace(e));
			log.error("Rtp sender failed to connect to " + connInfo.getRemoteAddr() + ".");
		}    	
    }

    public void run() {
	try   
    	  {  
		while(!stop)
 	        {
			byte array[]= new byte[]{0,0,0,0};
			sendAudio(array, startTimestamp);
			startTimestamp++;
			Thread.sleep(DELTA_TIME_TO_SEND_KEEPALIVE);
			
		}
	  }
	catch (InterruptedException e) {
		log.error("Failed to sleep time in keepAlive");
	}  
    }

     public void halt()
     { 
	stop=true;
     }

    
    public void sendAudio(byte[] audioData, long timestamp) {
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
		log.error("Failed to send data to server.");
	}  
    }
        
    private synchronized void rtpSocketSend(RtpPacket rtpPacket) throws StreamException  {
    	try {
			
			rtpSocket.send(rtpPacket);
	} catch (IOException e) {
			throw new StreamException("Failed to send data to server.");
	}         
    }
}
