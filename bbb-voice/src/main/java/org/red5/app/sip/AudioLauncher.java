package org.red5.app.sip;


import local.ua.MediaLauncher;

import java.net.DatagramSocket;

import org.red5.app.sip.codecs.Codec;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;


public class AudioLauncher implements MediaLauncher {

    protected static Logger log = Red5LoggerFactory.getLogger( AudioLauncher.class, "sip" );

    DatagramSocket socket = null;
//    public RTPStreamSender sender = null;
//    public RTPStreamReceiver receiver = null;

    private RtpReceiver rtpReceiver;
    private RtpSender rtpSender;
    
    public AudioLauncher( Codec sipCodec, int localPort,
            String remoteAddr, int remotePort, RTMPUser rtmpUser ) {
        
        try {
            socket = new DatagramSocket( localPort );
            
            printLog( "SIPAudioLauncher", 
                    "New audio sender to " + remoteAddr + ":" + remotePort + "." );
            printLog( "SIPAudioLauncher", 
                    "sender configs: payloadType = [" + sipCodec.getCodecId() + 
                    "], payloadName = [" + sipCodec.getCodecName() + "].");
            
           // sender = new RTPStreamSender( rtmpUser, false, sipCodec, socket, remoteAddr, remotePort );
            NellyToPcmTranscoder pTranscoder = new NellyToPcmTranscoder(sipCodec);
            rtpSender = new RtpSender(pTranscoder, false, socket, remoteAddr, remotePort);
            rtmpUser.setRtpSender(rtpSender);
            printLog( "SIPAudioLauncher", "New audio receiver on " + localPort + "." );
            
            //receiver = new RTPStreamReceiver( sipCodec, rtmpUser, socket );
            PcmToNellyTranscoder transcoder = new PcmToNellyTranscoder(sipCodec);
            rtpReceiver = new RtpReceiver(rtmpUser, transcoder, socket);
        }
        catch ( Exception e ) {
            printLog( "SIPAudioLauncher", "Exception " + e );
            e.printStackTrace();
        }
    }

    public boolean isReceiverRunning() {
    	return rtpReceiver.isRunning();
    }
    
    public void queueSipDtmfDigits( String argDigits ) {
    	if (rtpSender != null)
    		rtpSender.queueSipDtmfDigits(argDigits);
    }
    
    public boolean startMedia() {

        printLog( "startMedia", "Starting sip audio..." );

        if (rtpSender != null) {
            printLog( "startMedia", "Start sending." );
            rtpSender.start();
        }
/*        
        if ( sender != null ) {
            printLog( "startMedia", "Start sending." );
            sender.start();
        }

        if ( receiver != null ) {
            printLog( "startMedia", "Start receiving." );
            receiver.start();
        }
*/
        if ( rtpReceiver != null ) {
            printLog( "startMedia", "Start receiving." );
            rtpReceiver.start();
        }
        
        
        return true;
    }


    public boolean stopMedia() {

        printLog( "stopMedia", "Halting sip audio..." );
        if (rtpSender != null ) {
        	rtpSender.halt();
        	rtpSender = null;
            printLog( "stopMedia", "Sender halted." );
        }
        
        /*        
        if ( sender != null ) {
            sender.halt();
            sender = null;
            printLog( "stopMedia", "Sender halted." );
        }

        if ( receiver != null ) {
            receiver.halt();
            receiver = null;
            printLog( "stopMedia", "Receiver halted." );
        }
*/
        if ( rtpReceiver != null ) {
        	rtpReceiver.halt();
        	rtpReceiver = null;
            printLog( "stopMedia", "Receiver halted." );
        }
        
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
