package org.bigbluebutton.voiceconf.red5.media;

import local.net.RtpPacket;
import local.net.RtpSocket;

import java.io.IOException;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.UnknownHostException;

import org.slf4j.Logger;
import org.bigbluebutton.voiceconf.red5.media.transcoder.Transcoder;
import org.bigbluebutton.voiceconf.sip.SipConnectInfo;
import org.bigbluebutton.voiceconf.util.StackTraceUtil;
import org.red5.logging.Red5LoggerFactory;

public class RtpStreamSender {
    private static Logger log = Red5LoggerFactory.getLogger(RtpStreamSender.class, "sip");
	
    private static final int RTP_HEADER_SIZE = 12;
    private RtpSocket rtpSocket = null;
    private byte[] transcodedAudioDataBuffer;
    private RtpPacket rtpPacket;
    private int startPayloadPos;
    private static final int DTMF2833 = 101;
    private int sequenceNum = 0;
    private long timestamp = 0;
    private final Transcoder transcoder;
    private final DatagramSocket srcSocket;
    private final SipConnectInfo connInfo;
    
    public RtpStreamSender(Transcoder transcoder, DatagramSocket srcSocket, SipConnectInfo connInfo)  {
        this.transcoder = transcoder;        
        this.srcSocket = srcSocket;
        this.connInfo = connInfo;
    }

    public void connect() throws StreamException {
    	try {
			rtpSocket = new RtpSocket(srcSocket, InetAddress.getByName(connInfo.getRemoteAddr()), connInfo.getRemotePort());
			init();
		} catch (UnknownHostException e) {
			log.error("Failed to connect to {}", connInfo.getRemoteAddr());
			log.error(StackTraceUtil.getStackTrace(e));
			throw new StreamException("Rtp sender failed to connect to " + connInfo.getRemoteAddr() + ".");
		}    	
    }

    private void init() {
        transcodedAudioDataBuffer = new byte[transcoder.getOutgoingEncodedFrameSize() + RTP_HEADER_SIZE];
        rtpPacket = new RtpPacket(transcodedAudioDataBuffer, 0);
        rtpPacket.setPayloadType(transcoder.getCodecId());
        startPayloadPos = rtpPacket.getHeaderLength();
        sequenceNum = 0;
        timestamp = 0;    	
    }
    
    public void sendDtmfDigits(String dtmfDigits) throws StreamException {
        byte[] dtmfbuf = new byte[transcoder.getOutgoingEncodedFrameSize() + RTP_HEADER_SIZE];
        RtpPacket dtmfpacket = new RtpPacket(dtmfbuf, 0);
        dtmfpacket.setPayloadType(DTMF2833);
        dtmfpacket.setPayloadLength(transcoder.getOutgoingEncodedFrameSize());

        byte[] blankbuf = new byte[transcoder.getOutgoingEncodedFrameSize() + RTP_HEADER_SIZE];
        RtpPacket blankpacket = new RtpPacket(blankbuf, 0);
        blankpacket.setPayloadType(transcoder.getCodecId());
        blankpacket.setPayloadLength(transcoder.getOutgoingEncodedFrameSize());

        for (int d = 0; d < dtmfDigits.length(); d++) {
            char digit = dtmfDigits.charAt(d);
            if (digit == '*') {
                dtmfbuf[startPayloadPos] = 10;
            }
            else if (digit == '#') {
                dtmfbuf[startPayloadPos] = 11;
            }
            else if (digit >= 'A' && digit <= 'D') {
                dtmfbuf[startPayloadPos] = (byte) (digit - 53);
            }
            else {
                dtmfbuf[startPayloadPos] = (byte) (digit - 48);
            }

            // notice we are bumping times/seqn just like audio packets
            // send start event packet 3 times
            dtmfbuf[startPayloadPos + 1] = 0; // start event flag and volume
            dtmfbuf[startPayloadPos + 2] = 1; // duration 8 bits
            dtmfbuf[startPayloadPos + 3] = -32; // duration 8 bits

            for (int r = 0; r < 3; r++) {
            	dtmfpacket.setSequenceNumber(sequenceNum++);
            	dtmfpacket.setTimestamp(transcoder.getOutgoingEncodedFrameSize());
            	doRtpDelay();
            	rtpSocketSend(dtmfpacket);
            }

            // send end event packet 3 times
            dtmfbuf[startPayloadPos + 1] = -128; // end event flag
            dtmfbuf[startPayloadPos + 2] = 3; // duration 8 bits
            dtmfbuf[startPayloadPos + 3] = 116; // duration 8 bits
            for (int r = 0; r < 3; r++) {
            	dtmfpacket.setSequenceNumber(sequenceNum++);
            	dtmfpacket.setTimestamp(transcoder.getOutgoingEncodedFrameSize() );
            	doRtpDelay();
            	rtpSocketSend(dtmfpacket);
            }

            // send 200 ms of blank packets
            for (int r = 0; r < 200 / transcoder.getOutgoingPacketization(); r++) {
            	blankpacket.setSequenceNumber(sequenceNum++);
            	blankpacket.setTimestamp(transcoder.getOutgoingEncodedFrameSize());
            	doRtpDelay();
            	rtpSocketSend(blankpacket);
            }
        }
    }

    public void send(byte[] audioData, int offset, int num) {
    	transcoder.transcode(audioData, offset, num, transcodedAudioDataBuffer, RTP_HEADER_SIZE, this);
    }
    
    public void sendTranscodedData() throws StreamException {
        rtpPacket.setSequenceNumber(sequenceNum++);
        timestamp += transcoder.getOutgoingEncodedFrameSize();        
        rtpPacket.setTimestamp(timestamp);
        rtpPacket.setPayloadLength(transcoder.getOutgoingEncodedFrameSize());
        rtpSocketSend(rtpPacket);    	
    }
    
    private void doRtpDelay() {
        try {
            Thread.sleep(transcoder.getOutgoingPacketization() - 2);
        } catch (Exception e) {
        }
    }

    private synchronized void rtpSocketSend(RtpPacket rtpPacket) throws StreamException  {
    	try {
			rtpSocket.send(rtpPacket);
			timestamp += rtpPacket.getPayloadLength();
		} catch (IOException e) {
			log.error("Exception while trying to send rtp packet");
			log.error(StackTraceUtil.getStackTrace(e));
			throw new StreamException("Failed to send data to server.");
		}         
    }
}
