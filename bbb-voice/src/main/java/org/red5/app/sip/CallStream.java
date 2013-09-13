package org.red5.app.sip;

import java.net.DatagramSocket;
import java.net.SocketException;

import org.red5.app.sip.codecs.Codec;
import org.red5.app.sip.codecs.SpeexCodec;
import org.red5.app.sip.stream.ListenStream;
import org.red5.app.sip.stream.ReceivedRtpPacketProcessor;
import org.red5.app.sip.stream.RtpStreamReceiver;
import org.red5.app.sip.stream.RtpStreamReceiverListener;
import org.red5.app.sip.stream.RtpStreamSender;
import org.red5.app.sip.stream.TalkStream;
import org.red5.app.sip.trancoders.NellyToPcmTranscoder;
import org.red5.app.sip.trancoders.PcmToNellyTranscoder;
import org.red5.app.sip.trancoders.SpeexToSpeexTranscoder;
import org.red5.app.sip.trancoders.Transcoder;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.scope.IScope;
import org.red5.server.api.stream.IBroadcastStream;

public class CallStream implements RtpStreamReceiverListener {
    private final static Logger log = Red5LoggerFactory.getLogger(CallStream.class, "sip");

    private DatagramSocket socket = null;
    private final RtpStreamReceiver rtpReceiver;
    private final RtpStreamSender rtpSender;
    private final TalkStream talkStream;
    private final ListenStream listenStream;
    private final ReceivedRtpPacketProcessor packetProcessor;
    
    public CallStream(Codec sipCodec, SipConnectInfo connInfo, ScopeProvider scopeProvider) throws Exception {        
    	try {
			socket = new DatagramSocket(connInfo.getLocalPort());
		} catch (SocketException e) {
			log.error("SocketException while initializing DatagramSocket");
			throw new Exception("Exception while initializing CallStream");
		}     
        
		listenStream = new ListenStream(scopeProvider.getScope());
		
		Transcoder rtmpToRtpTranscoder, rtpToRtmpTranscoder;
		if (sipCodec.getCodecId() == SpeexCodec.codecId) {
			rtmpToRtpTranscoder = new SpeexToSpeexTranscoder(sipCodec);
			rtpToRtmpTranscoder = new SpeexToSpeexTranscoder(sipCodec, listenStream);
		} else {
			rtmpToRtpTranscoder = new NellyToPcmTranscoder(sipCodec);
			rtpToRtmpTranscoder = new PcmToNellyTranscoder(sipCodec, listenStream);			
		}
		
		packetProcessor = new ReceivedRtpPacketProcessor(rtpToRtmpTranscoder);		
		rtpReceiver = new RtpStreamReceiver(packetProcessor, socket, rtpToRtmpTranscoder.getIncomingEncodedFrameSize());
		rtpSender = new RtpStreamSender(rtmpToRtpTranscoder, socket, connInfo.getRemoteAddr(), connInfo.getRemotePort());
		talkStream = new TalkStream(rtmpToRtpTranscoder, rtpSender);
    }
    
    public String getTalkStreamName() {
    	return talkStream.getStreamName();
    }
    
    public String getListenStreamName() {
    	return listenStream.getStreamName();
    }
    
    public void queueSipDtmfDigits(String argDigits) {
    	if (rtpSender != null)
    		rtpSender.queueSipDtmfDigits(argDigits);
    }
    
    public void startTalkStream(IBroadcastStream broadcastStream, IScope scope) {
    	talkStream.start(broadcastStream, scope);
    	packetProcessor.start();
		listenStream.start();
		rtpSender.start(); 
		rtpReceiver.setRtpStreamReceiverListener(this);
		rtpReceiver.start();
    }
    
    public void stopTalkStream(IBroadcastStream broadcastStream, IScope scope) {
    	stopMedia();
    }

    public boolean stopMedia() {
        printLog( "stopMedia", "Halting sip audio..." );
        talkStream.stop();
        listenStream.stop();
        packetProcessor.stop();
		rtpSender.stop(); 
		rtpReceiver.stop();
		
        return true;
    }


    private static void printLog( String method, String message ) {    	
        log.debug( "SipAudioLauncher - " + method + " -> " + message );
        System.out.println( "SipAudioLauncher - " + method + " -> " + message );
    }

	public void onStoppedReceiving() {
		System.out.println("Closing socket");
		socket.close();
	}
}
