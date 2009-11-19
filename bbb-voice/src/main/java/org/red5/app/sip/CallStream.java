package org.red5.app.sip;

import java.net.DatagramSocket;
import java.net.SocketException;

import org.red5.app.sip.codecs.Codec;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IScope;
import org.red5.server.api.stream.IBroadcastStream;

public class CallStream {
    private final static Logger log = Red5LoggerFactory.getLogger(CallStream.class, "sip");

    private DatagramSocket socket = null;
    private final RtpReceiver2 rtpReceiver;
    private final RtpSender2 rtpSender;
    private final TalkStream talkStream;
    private final ListenStream listenStream;
    
    public CallStream(Codec sipCodec, SipConnectInfo connInfo, ScopeProvider scopeProvider) throws Exception {        
    	try {
			socket = new DatagramSocket(connInfo.getLocalPort());
		} catch (SocketException e) {
			log.error("SocketException while initializing DatagramSocket");
			throw new Exception("Exception while initializing CallStream");
		}     
                        
		NellyToPcmTranscoder2 pTranscoder = new NellyToPcmTranscoder2(sipCodec);
		rtpSender = new RtpSender2(pTranscoder, socket, connInfo.getRemoteAddr(), connInfo.getRemotePort());
		printLog( "SIPAudioLauncher", "New audio receiver on " + connInfo.getLocalPort() + "." );
        rtpSender.start();    
		talkStream = new TalkStream(pTranscoder, rtpSender);
		listenStream = new ListenStream(scopeProvider.getScope());
            
		PcmToNellyTranscoder2 transcoder = new PcmToNellyTranscoder2(sipCodec, listenStream);
		rtpReceiver = new RtpReceiver2(transcoder, socket);
		listenStream.start();
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
    }
    
    public void stopTalkStream(IBroadcastStream broadcastStream, IScope scope) {
    	talkStream.stop();
    }
    
    public boolean startMedia1() {
        printLog( "startMedia", "Starting sip audio..." );

        if ( rtpReceiver != null ) {
            printLog( "startMedia", "Start receiving." );
            rtpReceiver.start();
        }
               
        return true;
    }


    public boolean stopMedia() {
        printLog( "stopMedia", "Halting sip audio..." );
        talkStream.stop();
        listenStream.stop();
        
        // take into account the resilience of RtpStreamSender
        // (NOTE: it does not take into account the resilience of
        // RtpStreamReceiver; this can cause SocketException)
        try {
            Thread.sleep( RTPStreamReceiver.SO_TIMEOUT );
        }
        catch ( Exception e ) {
        }
        socket.close();
        return true;
    }


    private static void printLog( String method, String message ) {    	
        log.debug( "SipAudioLauncher - " + method + " -> " + message );
        System.out.println( "SipAudioLauncher - " + method + " -> " + message );
    }
}
