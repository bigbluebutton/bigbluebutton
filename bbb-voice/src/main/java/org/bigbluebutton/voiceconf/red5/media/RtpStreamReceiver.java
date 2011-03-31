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
package org.bigbluebutton.voiceconf.red5.media;

import java.io.IOException;
import java.net.DatagramSocket;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import org.slf4j.Logger;
import org.bigbluebutton.voiceconf.red5.media.net.RtpPacket;
import org.bigbluebutton.voiceconf.red5.media.net.RtpSocket;
import org.red5.logging.Red5LoggerFactory;

/*****************************************************************************
;  RtpStreamReceiver
;----------------------------------------------------------------------------
; DESCRIPTION
;   this class is used to receive stream from rtp
;
; HISTORY
; __date__ :        PTS:            Description
; 03-30-2011
******************************************************************************/
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
    private boolean firstPacket = true;
    private boolean lastPacketDropped = false;
    private int successivePacketDroppedCount = 0;
    
    private long lastPacketReceived = 0;
    
    /*****************************************************************************
    ;  RtpStreamReceiver
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this is the class constructor.
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   socket                  :   DatagramSocket
    ;   expectedPayloadLength   :   int
    ;   
    ; IMPLEMENTATION
    ;  initialize socket
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
    public RtpStreamReceiver(DatagramSocket socket, int expectedPayloadLength) {
        
        if ( null == socket ){
            log.error("error input parameter");
        }
        
    	this.payloadLength = expectedPayloadLength;
        rtpSocket = new RtpSocket(socket);
        if ( null == rtpSocket ){
            log.error("error initialize rtpSocket");
        }
        initializeSocket();
    }/**END FUNCTION RtpStreamReceiver**/
    
    /*****************************************************************************
    ;  setRtpStreamReceiverListener
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to set stream receiver listener.
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   listener    :   RtpStreamReceiverListener
    ;   
    ; IMPLEMENTATION
    ;  assign listener
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
    public void setRtpStreamReceiverListener(RtpStreamReceiverListener listener) {
    	this.listener = listener;
    }/**END FUNCTION setRtpStreamReceiverListener**/
    
    /*****************************************************************************
    ;  initializeSocket
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to initialize socket
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
    private void initializeSocket() {
    }/**END FUNCTION initializeSocket**/
    
    /*****************************************************************************
    ;  start
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to start the packet receiver
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   
    ; IMPLEMENTATION
    ;  start receive rtp packet
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
    public void start() {
    	receivePackets = true;
    	rtpPacketReceiver = new Runnable() {
    		public void run() {
    			receiveRtpPackets();   			
    		}
    	};
    	exec.execute(rtpPacketReceiver);
    }/**END FUNCTION start**/
    
    /*****************************************************************************
    ;  stop
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to stop the packet receiver
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   
    ; IMPLEMENTATION
    ;  stop receive rtp packet
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
    public void stop() {
    	receivePackets = false;
    }/**END FUNCTION stop**/
    
    /*****************************************************************************
    ;  receiveRtpPackets
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to receive the packet
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   
    ; IMPLEMENTATION
    ;  initialize buffer
    ;  receive rtp packets
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
    public void receiveRtpPackets() {    
        int packetReceivedCounter = 0;
        int internalBufferLength = payloadLength + RTP_HEADER_SIZE;
        byte[] internalBuffer = new byte[internalBufferLength];
        RtpPacket rtpPacket = new RtpPacket(internalBuffer, internalBufferLength);;
        if ( null == rtpPacket ){
            log.error("error initialize rtpPacket");
            return ;
        }
        
        while (receivePackets) {
        	try {       			
        		rtpSocket.receive(rtpPacket);        		
        		packetReceivedCounter++;  
        		if (shouldDropDelayedPacket(rtpPacket)) {
        			continue;
        		}
        		if (rtpPacket.isRtcpPacket()) {
        			/**
        			 * Asterisk (1.6.2.5) send RTCP packets. We just ignore them (for now).
        			 * It could be for KeepAlive (http://tools.ietf.org/html/draft-ietf-avt-app-rtp-keepalive-09)
        			 */
        			if (log.isDebugEnabled()) 
        				log.debug("RTCP packet [" + rtpPacket.getRtcpPayloadType() + ", length=" + rtpPacket.getPayloadLength() + "] seqNum[rtpSeqNum=" + rtpPacket.getSeqNum() + ",lastSeqNum=" + lastSequenceNumber 
        					+ "][rtpTS=" + rtpPacket.getTimestamp() + ",lastTS=" + lastPacketTimestamp + "][port=" + rtpSocket.getDatagramSocket().getLocalPort() + "]");          			
        		} else {
            		if (shouldHandlePacket(rtpPacket)) {        			            			
            			lastSequenceNumber = rtpPacket.getSeqNum();
            			lastPacketTimestamp = rtpPacket.getTimestamp();
            			processRtpPacket(internalBuffer, RTP_HEADER_SIZE, rtpPacket.getPayloadLength());
            		} else {
            			if (log.isDebugEnabled())
            				log.debug("Corrupt packet [" + rtpPacket.getRtcpPayloadType() + "," + rtpPacket.getPayloadType() + ", length=" + rtpPacket.getPayloadLength() + "] seqNum[rtpSeqNum=" + rtpPacket.getSeqNum() + ",lastSeqNum=" + lastSequenceNumber 
            					+ "][rtpTS=" + rtpPacket.getTimestamp() + ",lastTS=" + lastPacketTimestamp + "][port=" + rtpSocket.getDatagramSocket().getLocalPort() + "]");          			       			

            			if (lastPacketDropped) successivePacketDroppedCount++;
            			else lastPacketDropped = true;           			
            		}
            	}
        	} catch (IOException e) { // We get this when the socket closes when the call hangs up.        		
        		receivePackets = false;
        	}
        }
        log.debug("Rtp Receiver stopped. Packet Received = " + packetReceivedCounter + "." );
        if (listener != null) listener.onStoppedReceiving();
    }/**END FUNCTION receiveRtpPackets**/
    
    /*****************************************************************************
    ;  shouldDropDelayedPacket
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to drop the delay packet
    ;
    ; RETURNS : boolean
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   rtpPacket   :   RtpPacket
    ;
    ; IMPLEMENTATION
    ;  check the drop packets
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
    private boolean shouldDropDelayedPacket(RtpPacket rtpPacket) {
    
        if ( null == rtpPacket ){
            log.error("error input parameter");
            return true ;
        }
        
    	long now = System.currentTimeMillis();
    	if (now - lastPacketReceived > 200) {
    		if (log.isDebugEnabled())
    			log.debug("Delayed packet [" + rtpPacket.getRtcpPayloadType() + "," + rtpPacket.getPayloadType() + ", length=" + rtpPacket.getPayloadLength() + "] seqNum[rtpSeqNum=" + rtpPacket.getSeqNum() + ",lastSeqNum=" + lastSequenceNumber 
					+ "][rtpTS=" + rtpPacket.getTimestamp() + ",lastTS=" + lastPacketTimestamp + "][port=" + rtpSocket.getDatagramSocket().getLocalPort() + "]");          			       			
			lastPacketReceived = now;
    		return true;
    	}
    	lastPacketReceived = now;
    	return false;
    }/**END FUNCTION shouldDropDelayedPacket**/
    
    /*****************************************************************************
    ;  isMarkerPacket
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to set whether packet is marked
    ;
    ; RETURNS : boolean
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   rtpPacket   :   RtpPacket
    ;
    ; IMPLEMENTATION
    ;  check whether packet is marker
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
    private boolean isMarkerPacket(RtpPacket rtpPacket) {
    	
        if ( null == rtpPacket ){
            log.error("error input parameter");
            return true ;
        }
        /*
    	 * FreeSWITCH sends a marker packet at the beginning of the voice frame.
    	 * If you stop talking and then start talking, a marker packet is received on start talking. (ralam sept 20, 2010).
    	 */
		if (rtpPacket.hasMarker()) {
			if (log.isDebugEnabled())
				log.debug("Marked packet [" + rtpPacket.getPayloadType() + ", length=" + rtpPacket.getPayloadLength() + "] seqNum[rtpSeqNum=" + rtpPacket.getSeqNum() + ",lastSeqNum=" + lastSequenceNumber 
   					+ "][rtpTS=" + rtpPacket.getTimestamp() + ",lastTS=" + lastPacketTimestamp + "][port=" + rtpSocket.getDatagramSocket().getLocalPort() + "]");       				        			
   			return true;
		}    	

		return false;
    }/**END FUNCTION isMarkerPacket**/
    
    
    /*****************************************************************************
    ;  shouldHandlePacket
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to set whether packet should handle
    ;
    ; RETURNS : boolean
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   rtpPacket   :   RtpPacket
    ;
    ; IMPLEMENTATION
    ;  check if packet should handle
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
    private boolean shouldHandlePacket(RtpPacket rtpPacket) {
    
        if ( null == rtpPacket ){
            log.error("error input parameter");
            return true ;
        }
		/** Take seq number only into account and not timestamps. Seems like the timestamp sometimes change whenever the audio changes source.
		 *  For example, in FreeSWITCH, the audio prompt will have it's own "start" timestamp and then
		 *  another "start" timestamp will be generated for the voice. (ralam, sept 7, 2010).
		 *	&& packetIsNotCorrupt(rtpPacket)) {
		**/
    	 return isFirstPacket(rtpPacket) || isMarkerPacket(rtpPacket) || resetDueToSuccessiveDroppedPackets() || validSeqNum(rtpPacket) || seqNumRolledOver(rtpPacket);    			
    }/**END FUNCTION shouldHandlePacket**/
    
    /*****************************************************************************
    ;  resetDueToSuccessiveDroppedPackets
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to reset dropped packets
    ;
    ; RETURNS : boolean
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;
    ;
    ; IMPLEMENTATION
    ;  check if packets have to reset
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
    private boolean resetDueToSuccessiveDroppedPackets() {
    	/*
    	 * I notice that Asterisk (1.6.2.5) sets the rtp sequence number to 12 every time it sends a marked rtp packet. This screws up our
    	 * way of determining which packet to drop. To get around this, we detect if consecutive packets have been dropped then reset
    	 * the sequence number to handle the next incoming packets (ralam sept. 20, 2010).
    	 */
    	if (lastPacketDropped && successivePacketDroppedCount > 3) {
    		if (log.isDebugEnabled())
    			log.debug("Resetting after successive dropped packets [successivePacketDroppedCount=" + successivePacketDroppedCount + 
   					"][port=" + rtpSocket.getDatagramSocket().getLocalPort() + "]");
    		lastPacketDropped = false;
    		successivePacketDroppedCount = 0;
    		return true;
    	}
    	return false;
    }/**END FUNCTION resetDueToSuccessiveDroppedPackets**/
    
    /*****************************************************************************
    ;  isFirstPacket
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to check whether the packet is the first packet
    ;
    ; RETURNS : boolean
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   rtpPacket   :   RtpPacket
    ;
    ; IMPLEMENTATION
    ;  check if the packets is the first one
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
    private boolean isFirstPacket(RtpPacket rtpPacket) {
    
        if ( null == rtpPacket ){
            log.error("error input parameter");
            return false ;
        }
        
		if (firstPacket) {
			lastPacketReceived = System.currentTimeMillis();
			firstPacket = false;
			if (log.isDebugEnabled())
				log.debug("First packet [" + rtpPacket.getPayloadType() + ", length=" + rtpPacket.getPayloadLength() + "] seqNum[rtpSeqNum=" + rtpPacket.getSeqNum() + ",lastSeqNum=" + lastSequenceNumber 
						+ "][rtpTS=" + rtpPacket.getTimestamp() + ",lastTS=" + lastPacketTimestamp + "][port=" + rtpSocket.getDatagramSocket().getLocalPort() + "]");
			return true;
		}
		return false;
    }/**END FUNCTION isFirstPacket**/
    
    /*****************************************************************************
    ;  validSeqNum
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to check the valid seqment number
    ;
    ; RETURNS : boolean
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   rtpPacket   :   RtpPacket
    ;
    ; IMPLEMENTATION
    ;  check valid seqment number
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
    private boolean validSeqNum(RtpPacket rtpPacket) {
    
        if ( null == rtpPacket ){
            log.error("error input parameter");
            return false ;
        }
    	/*
    	 * Assume if the sequence number jumps by more that 100, that the sequence number is corrupt.
    	 */
    	return (rtpPacket.getSeqNum() > lastSequenceNumber && rtpPacket.getSeqNum() - lastSequenceNumber < 100);
    }/**END FUNCTION validSeqNum**/
    
    /*****************************************************************************
    ;  seqNumRolledOver
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to check the roll over seq number
    ;
    ; RETURNS : boolean
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   rtpPacket   :   RtpPacket
    ;
    ; IMPLEMENTATION
    ;  check if seqment number is roll over
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
    private boolean seqNumRolledOver(RtpPacket rtpPacket) {
        
        if ( null == rtpPacket ){
            log.error("error input parameter");
            return false ;
        }
    	/*
    	 * Max sequence num is 65535 (16-bits). Let's use 65000 as check to take into account
    	 * delayed packets.
    	 */
    	if (lastSequenceNumber - rtpPacket.getSeqNum() > 65000) {
    		if (log.isDebugEnabled())
    			log.debug("Packet rolling over seqNum[rtpSeqNum=" + rtpPacket.getSeqNum() + ",lastSeqNum=" + lastSequenceNumber 
    					+ "][rtpTS=" + rtpPacket.getTimestamp() + ",lastTS=" + lastPacketTimestamp + "][port=" + rtpSocket.getDatagramSocket().getLocalPort() + "]");  
			return true;	
    	}
    	return false;
    }/**END FUNCTION seqNumRolledOver**/

    /*****************************************************************************
    ;  processRtpPacket
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to process the rtp packet
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   rtpAudio    :   byte[]
    ;   offset      :   int
    ;   len         :   int
    ;
    ; IMPLEMENTATION
    ;  process rtp packets
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
    private void processRtpPacket(byte[] rtpAudio, int offset, int len) {
		if (listener != null) listener.onAudioDataReceived(rtpAudio, offset, len);
		else log.debug("No listener for incoming audio packet");    	
    }/**END FUNCTION processRtpPacket**/
}/**END CLASS RtpStreamReceiver**/
