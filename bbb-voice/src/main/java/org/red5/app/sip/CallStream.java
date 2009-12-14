package org.red5.app.sip;

import java.net.DatagramSocket;
import java.net.SocketException;

import org.red5.app.sip.codecs.Codec;
import org.red5.app.sip.codecs.SpeexCodec;
import org.red5.app.sip.stream.ListenStream;
import org.red5.app.sip.stream.RtpStreamReceiver;
import org.red5.app.sip.stream.RtpStreamSender;
import org.red5.app.sip.stream.TalkStream;
import org.red5.app.sip.trancoders.NellyToPcmTranscoder2;
import org.red5.app.sip.trancoders.PcmToNellyTranscoder2;
import org.red5.app.sip.trancoders.SpeexToSpeexTranscoder;
import org.red5.app.sip.trancoders.Transcoder;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IScope;
import org.red5.server.api.stream.IBroadcastStream;

public class CallStream {
    private final static Logger log = Red5LoggerFactory.getLogger(CallStream.class, "sip");

    private DatagramSocket socket = null;
    private final RtpStreamReceiver rtpReceiver;
    private final RtpStreamSender rtpSender;
    private final TalkStream talkStream;
    private final ListenStream listenStream;
    
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
			rtmpToRtpTranscoder = new NellyToPcmTranscoder2(sipCodec);
			rtpToRtmpTranscoder = new PcmToNellyTranscoder2(sipCodec, listenStream);
			
		}
		
		rtpReceiver = new RtpStreamReceiver(rtpToRtmpTranscoder, socket);
		rtpSender = new RtpStreamSender(rtmpToRtpTranscoder, socket, connInfo.getRemoteAddr(), connInfo.getRemotePort());
		talkStream = new TalkStream(rtmpToRtpTranscoder, rtpSender);
		rtpSender.start(); 
		rtpReceiver.start();
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
    	listenStream.start();
    }
    
    public void stopTalkStream(IBroadcastStream broadcastStream, IScope scope) {
    	talkStream.stop();
    	listenStream.stop();
    }

    public boolean stopMedia() {
        printLog( "stopMedia", "Halting sip audio..." );
        talkStream.stop();
        listenStream.stop();
        return true;
    }


    private static void printLog( String method, String message ) {    	
        log.debug( "SipAudioLauncher - " + method + " -> " + message );
        System.out.println( "SipAudioLauncher - " + method + " -> " + message );
    }
}
