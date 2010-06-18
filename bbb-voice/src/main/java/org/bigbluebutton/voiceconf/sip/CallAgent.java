package org.bigbluebutton.voiceconf.sip;

import org.zoolu.sip.call.*;
import org.zoolu.sip.address.*;
import org.zoolu.sip.provider.SipProvider;
import org.zoolu.sip.header.StatusLine;
import org.zoolu.sip.message.*;
import org.zoolu.sdp.*;
import org.bigbluebutton.voiceconf.red5.CallStreamFactory;
import org.bigbluebutton.voiceconf.red5.ClientConnectionManager;
import org.bigbluebutton.voiceconf.red5.media.CallStream;
import org.bigbluebutton.voiceconf.red5.media.StreamException;
import org.bigbluebutton.voiceconf.red5.media.StreamObserver;
import org.red5.app.sip.codecs.Codec;
import org.red5.app.sip.codecs.CodecUtils;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IScope;
import org.red5.server.api.stream.IBroadcastStream;
import org.zoolu.tools.Parser;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.Set;
import java.util.Vector;

public class CallAgent extends CallListenerAdapter  {
    private static Logger log = Red5LoggerFactory.getLogger(CallAgent.class, "sip");
    
    private final SipPeerProfile userProfile;
    private final SipProvider sipProvider;
    private ExtendedCall call;
    private CallStream callStream;    
    private String localSession = null;
    private Codec sipCodec = null;    
    private CallStreamFactory callStreamFactory;
    private ClientConnectionManager clientConnManager; 
    
    private final String clientId;
    
    private enum CallState {
    	UA_IDLE(0), UA_INCOMING_CALL(1), UA_OUTGOING_CALL(2), UA_ONCALL(3);    	
    	private final int state;
    	CallState(int state) {this.state = state;}
    	private int getState() {return state;}
    }

    private CallState callState;

    public CallAgent(SipProvider sipProvider, SipPeerProfile userProfile, String clientId) {
        this.sipProvider = sipProvider;
        this.userProfile = userProfile;
        this.clientId = clientId;
        
        userProfile.initContactAddress(sipProvider);        
        initSessionDescriptor();
    }
    
    public String getCallId() {
    	return clientId;
    }
    
    private void changeStatus(CallState state) {
    	callState = state;
    }
    
    public boolean isIdle() {
    	return callState == CallState.UA_IDLE;
    }
    
    private void initSessionDescriptor() {        
        log.debug("initSessionDescriptor");        
        SessionDescriptor newSdp = SdpUtils.createInitialSdp(userProfile.username, 
        		sipProvider.getViaAddress(), userProfile.audioPort, 
        		userProfile.videoPort, userProfile.audioCodecsPrecedence );        
        localSession = newSdp.toString();        
        log.debug("localSession Descriptor = " + localSession );
    }

    public void call(String targetUrl) {    	
    	log.debug("call {}", targetUrl);  
    	changeStatus(CallState.UA_OUTGOING_CALL);
        
        call = new ExtendedCall(sipProvider, userProfile.fromUrl, 
                userProfile.contactUrl, userProfile.username,
                userProfile.realm, userProfile.passwd, this);  
        
        // In case of incomplete url (e.g. only 'user' is present), 
        // try to complete it.       
        targetUrl = sipProvider.completeNameAddress(targetUrl).toString();
        log.debug("call {}", targetUrl);  
        if (userProfile.noOffer) {
            call.call(targetUrl);
        } else {
            call.call(targetUrl, localSession);
        }
    }

    /** Closes an ongoing, incoming, or pending call */
    public void hangup() {
    	log.debug("hangup");
    	
    	if (isIdle()) return;
    	
    	closeVoiceStreams();        
    	if (call != null) call.hangup();    
    	changeStatus(CallState.UA_IDLE); 
    }

    private void createVoiceStreams() {
        if (callStream != null) {            
        	log.debug("Media application is already running.");
            return;
        }
        
        SessionDescriptor localSdp = new SessionDescriptor(call.getLocalSessionDescriptor());        
        SessionDescriptor remoteSdp = new SessionDescriptor( call.getRemoteSessionDescriptor() );
        String remoteMediaAddress = (new Parser(remoteSdp.getConnection().toString())).skipString().skipString().getString();
        int remoteAudioPort = getRemoteAudioPort(remoteSdp);
        int localAudioPort = getLocalAudioPort(localSdp);
        
        log.debug("[localAudioPort=" + localAudioPort + ",remoteAudioPort=" + remoteAudioPort + "]");

        if (userProfile.audio && localAudioPort != 0 && remoteAudioPort != 0) {
            if ((callStream == null) && (sipCodec != null)) {   
            	SipConnectInfo connInfo = new SipConnectInfo(localAudioPort, remoteMediaAddress, remoteAudioPort);
            	
            	try {
					callStream = callStreamFactory.createCallStream(sipCodec, connInfo);
					callStream.start();
					notifyListenersOnCallConnected(callStream.getTalkStreamName(), callStream.getListenStreamName());
				} catch (Exception e) {
					log.error("Failed to create Call Stream.");
				}                
            }
        }
    }

    private void notifyListenersOnCallConnected(String talkStream, String listenStream) {
    	for (SipUserAgentListener listener : listeners) {
    		listener.onCallConnected(talkStream, listenStream);
    	}   	
    }
      
    private int getLocalAudioPort(SessionDescriptor localSdp) {
        int localAudioPort = 0;
        
        for (Enumeration e = localSdp.getMediaDescriptors().elements(); e.hasMoreElements();) {
            MediaField media = ((MediaDescriptor) e.nextElement()).getMedia();
            if (media.getMedia().equals("audio")) {
                localAudioPort = media.getPort();
            }
        }
        
        return localAudioPort;
    }
    
    private int getRemoteAudioPort(SessionDescriptor remoteSdp) {
    	int remoteAudioPort = 0;

        for (Enumeration e = remoteSdp.getMediaDescriptors().elements(); e.hasMoreElements();) {
            MediaDescriptor descriptor = (MediaDescriptor) e.nextElement();
            MediaField media = descriptor.getMedia();

            if (media.getMedia().equals("audio")) {
                remoteAudioPort = media.getPort();
            }
        }
        
        return remoteAudioPort;
    }
    
    public void startTalkStream(IBroadcastStream broadcastStream, IScope scope) {
    	try {
			callStream.startTalkStream(broadcastStream, scope);
		} catch (StreamException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}   	
    }
    
    public void stopTalkStream(IBroadcastStream broadcastStream, IScope scope) {
    	if (callStream != null) {
    		callStream.stopTalkStream(broadcastStream, scope);   	
    	}
    }
    
    private void closeVoiceStreams() {        
    	log.debug("closeMediaApplication" );
        
        if (callStream != null) {
        	callStream.stop();
        	callStream = null;
        }
    }

    // ********************** Call callback functions **********************
    private void createAudioCodec(SessionDescriptor newSdp) {
    	sipCodec = SdpUtils.getNegotiatedAudioCodec(newSdp);
    }
        
    private void setupSdpAndCodec(String sdp) {
    	SessionDescriptor remoteSdp = new SessionDescriptor(sdp);
        SessionDescriptor localSdp = new SessionDescriptor(localSession);
        
        log.debug("localSdp = " + localSdp.toString() + ".");
        log.debug("remoteSdp = " + remoteSdp.toString() + ".");
        
        // First we need to make payloads negotiation so the related attributes can be then matched.
        SessionDescriptor newSdp = SdpUtils.makeMediaPayloadsNegotiation(localSdp, remoteSdp);
        
        createAudioCodec(newSdp);
        
        // Now we complete the SDP negotiation informing the selected 
        // codec, so it can be internally updated during the process.
        SdpUtils.completeSdpNegotiation(newSdp, localSdp, remoteSdp);

        localSession = newSdp.toString();
        
        log.debug("newSdp = " + localSession + "." );
        
        // Finally, we use the "newSdp" and "remoteSdp" to initialize the lasting codec informations.
        CodecUtils.initSipAudioCodec(sipCodec, userProfile.audioDefaultPacketization, 
                userProfile.audioDefaultPacketization, newSdp, remoteSdp);
    }


    /** Callback function called when arriving a 2xx (call accepted) 
     *  The user has managed to join the conference.
     */ 
    public void onCallAccepted(Call call, String sdp, Message resp) {        
    	log.debug("Received 200/OK. So user has successfully joined the conference.");        
    	if (!isCurrentCall(call)) return;
        
        log.debug("ACCEPTED/CALL.");
        changeStatus(CallState.UA_ONCALL);

        setupSdpAndCodec(sdp);

        if (userProfile.noOffer) {
            // Answer with the local sdp.
            call.ackWithAnswer(localSession);
        }

        createVoiceStreams();
    }

    public void notifyListenersOfOnOutgoingCallAccepted() {
    	for (SipUserAgentListener listener : listeners) {
    		listener.onOutgoingCallAccepted();
    	}
    }

    /** Callback function called when arriving an ACK method (call confirmed) */
    public void onCallConfirmed(Call call, String sdp, Message ack) {
    	log.debug("Received ACK. Hmmm...is this for when the server initiates the call????");
        
    	if (!isCurrentCall(call)) return;
        
        log.debug("CONFIRMED/CALL.");
        changeStatus(CallState.UA_ONCALL);

        createVoiceStreams();
    }



    /** Callback function called when arriving a 4xx (call failure) */
    public void onCallRefused(Call call, String reason, Message resp) {        
    	log.debug("onCallRefused");
        
    	if (!isCurrentCall(call)) return;
    	
        log.debug("REFUSED (" + reason + ").");
        changeStatus(CallState.UA_IDLE);

        notifyListenersOnOutgoingCallFailed();
    }
    
    private void notifyListenersOnOutgoingCallFailed() {
    	for (SipUserAgentListener listener : listeners) {
    		listener.onOutgoingCallFailed();
    	}
    }

    /** Callback function called when arriving a 3xx (call redirection) */
    public void onCallRedirection(Call call, String reason, Vector contact_list, Message resp) {        
    	log.debug("onCallRedirection");
        
    	if (!isCurrentCall(call)) return;
        log.debug("REDIRECTION (" + reason + ")." );
        
        call.call(((String) contact_list.elementAt(0)));
    }


    /**
     * Callback function that may be overloaded (extended). Called when arriving a CANCEL request
     */
    public void onCallCanceling(Call call, Message cancel) {
    	log.error("Server shouldn't cancel call...or does it???");
        
    	if (!isCurrentCall(call)) return; 
        
        log.debug("Server has CANCEL-led the call.");
        changeStatus(CallState.UA_IDLE);
        notifyListenersOfOnIncomingCallCancelled();
    }
    
    private void notifyListenersOfOnIncomingCallCancelled() {
    	for (SipUserAgentListener listener : listeners) {
    		listener.onIncomingCallCancelled();
    	}
    }


    /** Callback function called when arriving a BYE request */
    public void onCallClosing(Call call, Message bye) {
    	log.debug("onCallClosing");
        
    	if (!isCurrentCall(call)) return;

        log.debug("CLOSE.");
        
        closeVoiceStreams();

        notifyListenersOfOnCallClosed();
        changeStatus(CallState.UA_IDLE);

        // Reset local sdp for next call.
        initSessionDescriptor();
    }

    private void notifyListenersOfOnCallClosed() {
    	for (SipUserAgentListener listener : listeners) {
    		listener.onCallClosed();
    	}
    }

    /**
     * Callback function called when arriving a response after a BYE request
     * (call closed)
     */
    public void onCallClosed(Call call, Message resp) {
    	log.debug("onCallClosed");
        
    	if (!isCurrentCall(call)) return; 
        
        log.debug("CLOSE/OK.");
        
        notifyListenersOfOnCallClosed();
        changeStatus(CallState.UA_IDLE);
    }


    /** Callback function called when the invite expires */
    public void onCallTimeout(Call call) {        
    	log.debug("onCallTimeout");
        
    	if (!isCurrentCall(call)) return; 
        
        log.debug("NOT FOUND/TIMEOUT.");
        changeStatus(CallState.UA_IDLE);

        notifyListenersOnOutgoingCallFailed();
    }

    private boolean isCurrentCall(Call call) {
    	return this.call == call;
    }
    
    public void setCallStreamFactory(CallStreamFactory csf) {
    	this.callStreamFactory = csf;
    }
    
	public void setClientConnectionManager(ClientConnectionManager ccm) {
		clientConnManager = ccm;
	}


}
