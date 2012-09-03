package org.red5.app.sip;

import org.zoolu.sip.call.*;
import org.zoolu.sip.address.*;
import org.zoolu.sip.provider.SipProvider;
import org.zoolu.sip.header.StatusLine;
import org.zoolu.sip.message.*;
import org.zoolu.sdp.*;
import org.red5.app.sip.codecs.Codec;
import org.red5.app.sip.codecs.CodecUtils;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.scope.IScope;
import org.red5.server.api.stream.IBroadcastStream;
import org.zoolu.tools.Parser;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.Set;
import java.util.Vector;

public class SipUserAgent extends CallListenerAdapter {
    private static Logger log = Red5LoggerFactory.getLogger(SipUserAgent.class, "sip");
    
    private SipUserAgentProfile userProfile;
    private SipProvider sipProvider;
    private ExtendedCall call;
    private ExtendedCall callTransfer;
    private CallStream callStream;    
    private String localSession = null;
    private Codec sipCodec = null;    
    private final ScopeProvider scopeProvider;
    private Set<SipUserAgentListener> listeners = new HashSet<SipUserAgentListener>();
    
    private enum CallState {
    	UA_IDLE(0), UA_INCOMING_CALL(1), UA_OUTGOING_CALL(2), UA_ONCALL(3);    	
    	private final int state;
    	CallState(int state) {this.state = state;}
    	private int getState() {return state;}
    }

    private CallState callState;

    public SipUserAgent(SipProvider sipProvider, SipUserAgentProfile userProfile, ScopeProvider scopeProvider) {
        this.scopeProvider = scopeProvider;
        this.sipProvider = sipProvider;
        this.userProfile = userProfile;
        
        // If no contact_url and/or from_url has been set, create it now.
        userProfile.initContactAddress(sipProvider);        
        // Set local sdp.
        initSessionDescriptor();
    }
    
    public void addListener(SipUserAgentListener listener) {
		listeners.add(listener);
	}
    
    public void removeListener(SipUserAgentListener listener) {
		listeners.remove(listener);
	}
    
    private void changeStatus(CallState state) {
    	callState = state;
    }
    
    public boolean isIdle() {
    	return callState == CallState.UA_IDLE;
    }
    
    public void queueSipDtmfDigits(String digits) {
    	callStream.queueSipDtmfDigits(digits);
    }
    
    public void initialize() {
    	waitForIncomingCalls();
    }
    
    public void initSessionDescriptor() {        
        log.debug("initSessionDescriptor");        
        SessionDescriptor newSdp = SdpUtils.createInitialSdp(userProfile.username, 
        		sipProvider.getViaAddress(), userProfile.audioPort, 
        		userProfile.videoPort, userProfile.audioCodecsPrecedence );        
        localSession = newSdp.toString();        
        log.debug("localSession Descriptor = " + localSession );
    }

    public void call(String targetUrl) {    	
    	log.debug( "call", "Init..." );  
    	changeStatus(CallState.UA_OUTGOING_CALL);
        
        call = new ExtendedCall(sipProvider, userProfile.fromUrl, 
                userProfile.contactUrl, userProfile.username,
                userProfile.realm, userProfile.passwd, this);  
        
        // In case of incomplete url (e.g. only 'user' is present), try to
        // complete it.       
        targetUrl = sipProvider.completeNameAddress(targetUrl).toString();

        if (userProfile.noOffer) {
            call.call(targetUrl);
        } else {
            call.call(targetUrl, localSession);
        }
    }

    /** Call Transfer test by Lior */
    public void transfer( String transferTo ){
	   log.debug("REFER/TRANSFER", "Init..." );
	   if (call != null && call.isOnCall()) {
  		   call.transfer(transferTo);
	   }
  	}
    /** end of transfer test code */


    /** Waits for an incoming call (acting as UAS). */
    private void waitForIncomingCalls() {
    	log.debug("waitForIncomingCalls..." );    
    	changeStatus(CallState.UA_IDLE);
        
        call = new ExtendedCall(sipProvider, userProfile.fromUrl, 
                userProfile.contactUrl, userProfile.username,
                userProfile.realm, userProfile.passwd, this);        
        call.listen();
    }


    /** Closes an ongoing, incoming, or pending call */
    public void hangup() {
    	log.debug("hangup");
    	
    	if (isIdle()) return;
    	
    	closeMediaApplication();        
    	if (call != null) call.hangup();    
    	changeStatus(CallState.UA_IDLE);
    	waitForIncomingCalls();   
    }


    /** Closes an ongoing, incoming, or pending call */
    public void accept() {        
    	log.debug("accept", "Init...");

        if (call != null) {
            call.accept(localSession);
        }
    }

    public void redirect(String redirection) {    	
    	log.debug( "redirect", "Init..." );
    	
        if (call != null) {
            call.redirect(redirection);
        }
    }

    protected void launchMediaApplication() {
        // Exit if the Media Application is already running.
        if (callStream != null) {            
        	log.debug("launchMediaApplication", "Media application is already running.");
            return;
        }
        
        SessionDescriptor localSdp = new SessionDescriptor( call.getLocalSessionDescriptor() );        
        SessionDescriptor remoteSdp = new SessionDescriptor( call.getRemoteSessionDescriptor() );
        String remoteMediaAddress = (new Parser(remoteSdp.getConnection().toString())).skipString().skipString().getString();
        int remoteAudioPort = getRemoteAudioPort(remoteSdp);
        int localAudioPort = getLocalAudioPort(localSdp);
        
        log.debug("[localAudioPort=" + localAudioPort + ",remoteAudioPort=" + remoteAudioPort + "]");

        if (userProfile.audio && localAudioPort != 0 && remoteAudioPort != 0) {
            if ((callStream == null) && (sipCodec != null)) {   
            	SipConnectInfo connInfo = new SipConnectInfo(localAudioPort, remoteMediaAddress, remoteAudioPort);
            	
            	try {
					callStream = new CallStream(sipCodec, connInfo, scopeProvider);
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
        //int localVideoPort = 0;

        // parse local sdp
        for ( Enumeration e = localSdp.getMediaDescriptors().elements(); e.hasMoreElements(); ) {
            MediaField media = ( (MediaDescriptor) e.nextElement() ).getMedia();
            if ( media.getMedia().equals( "audio" ) ) {
                localAudioPort = media.getPort();
            }
            //if ( media.getMedia().equals( "video" ) ) {
            //    localVideoPort = media.getPort();
            //}
        }
        
        return localAudioPort;
    }
    
    private int getRemoteAudioPort(SessionDescriptor remoteSdp) {
    	int remoteAudioPort = 0;
        //int remoteVideoPort = 0;

        for (Enumeration e = remoteSdp.getMediaDescriptors().elements(); e.hasMoreElements();) {
            MediaDescriptor descriptor = (MediaDescriptor) e.nextElement();
            MediaField media = descriptor.getMedia();

            if ( media.getMedia().equals( "audio" ) ) {
                remoteAudioPort = media.getPort();
            }

           // if ( media.getMedia().equals( "video" ) ) {
           //     remoteVideoPort = media.getPort();
           // }
        }
        
        return remoteAudioPort;
    }
    
    public void startTalkStream(IBroadcastStream broadcastStream, IScope scope) {
    	callStream.startTalkStream(broadcastStream, scope);   	
    }
    
    public void stopTalkStream(IBroadcastStream broadcastStream, IScope scope) {
    	if (callStream != null) {
    		callStream.stopTalkStream(broadcastStream, scope);   	
    	}
    }
    
    private void closeMediaApplication() {        
    	log.debug("closeMediaApplication" );
        
        if (callStream != null) {
        	callStream.stopMedia();
        	callStream = null;
        }
    }


    // ********************** Call callback functions **********************

    private void createAudioCodec(SessionDescriptor newSdp) {
    	sipCodec = SdpUtils.getNegotiatedAudioCodec(newSdp);
    }
    
    /**
     * Callback function called when arriving a new INVITE method (incoming call)
     */
    public void onCallIncoming(Call call, NameAddress callee, NameAddress caller, String sdp, Message invite) {        
    	log.debug("onCallIncoming");
        
    	if (!isCurrentCall(call)) return;
        
        log.debug("IncomingCallIncoming()");
        
        changeStatus(CallState.UA_INCOMING_CALL);
        call.ring();

        if (sdp != null) {
        	setupSdpAndCodec(sdp);
        }

        notifyListenersOfNewIncomingCall(callee, caller);
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

    private void notifyListenersOfNewIncomingCall(NameAddress callee, NameAddress caller) {
    	String source = caller.getAddress().toString();
        String sourceName = caller.hasDisplayName() ? caller.getDisplayName() : "";
        String destination = callee.getAddress().toString();
        String destinationName = callee.hasDisplayName() ? callee.getDisplayName() : "";
        
    	for (SipUserAgentListener listener : listeners) {
    		listener.onNewIncomingCall(source, sourceName, destination, destinationName);
    	}
    }

    /**
     * Callback function called when arriving a new Re-INVITE method (re-inviting/call modify)
     */
    public void onCallModifying(Call call, String sdp, Message invite) {
    	log.debug("onCallModifying");
        
    	if (!isCurrentCall(call)) return;
        
        log.debug("RE-INVITE/MODIFY.");
        
        // to be implemented.
        // currently it simply accepts the session changes (see method
        // onCallModifying() in CallListenerAdapter)
        super.onCallModifying(call, sdp, invite);
    }


    /**
     * Callback function that may be overloaded (extended). Called when arriving a 180 Ringing
     */
    public void onCallRinging(Call call, Message resp) {        
    	log.debug("onCallRinging");
        
    	if (!isCurrentCallOrCallTransfer(call)) return;
        
        log.debug("RINGING." );
        
        notifyListenersOfOnOutgoingCallRemoteRinging();
    }
    
    private void notifyListenersOfOnOutgoingCallRemoteRinging() {
    	for (SipUserAgentListener listener : listeners) {
    		listener.onOutgoingCallRemoteRinging();
    	}
    }


    /** Callback function called when arriving a 2xx (call accepted) */
    public void onCallAccepted(Call call, String sdp, Message resp) {        
    	log.debug( "onCallAccepted");
        
    	if (!isCurrentCallOrCallTransfer(call)) return;
        
        log.debug("ACCEPTED/CALL.");
        changeStatus(CallState.UA_ONCALL);

        setupSdpAndCodec(sdp);

        if (userProfile.noOffer) {
            // Answer with the local sdp.
            call.ackWithAnswer(localSession);
        }

        launchMediaApplication();

        if (call == callTransfer) {
            StatusLine statusLine = resp.getStatusLine();
            int code = statusLine.getCode();
            String reason = statusLine.getReason();
            this.call.notify(code, reason);
        }

        notifyListenersOfOnOutgoingCallAccepted();
    }

    public void notifyListenersOfOnOutgoingCallAccepted() {
    	for (SipUserAgentListener listener : listeners) {
    		listener.onOutgoingCallAccepted();
    	}
    }

    /** Callback function called when arriving an ACK method (call confirmed) */
    public void onCallConfirmed(Call call, String sdp, Message ack) {
    	log.debug("onCallConfirmed");
        
    	if (!isCurrentCall(call)) return;
        
        log.debug("CONFIRMED/CALL.");
        changeStatus(CallState.UA_ONCALL);

        launchMediaApplication();
    }


    /** Callback function called when arriving a 2xx (re-invite/modify accepted) */
    public void onCallReInviteAccepted(Call call, String sdp, Message resp) {
    	log.debug( "onCallReInviteAccepted");
        
    	if (!isCurrentCall(call)) return;
        
        log.debug("RE-INVITE-ACCEPTED/CALL." );
    }


    /** Callback function called when arriving a 4xx (re-invite/modify failure) */
    public void onCallReInviteRefused(Call call, String reason, Message resp) {
    	log.debug("onCallReInviteRefused");
        
    	if (!isCurrentCall(call)) return;
        
        log.debug("RE-INVITE-REFUSED (" + reason + ")/CALL.");
        
        notifyListenersOnOutgoingCallFailed();
        waitForIncomingCalls();
    }

    /** Callback function called when arriving a 4xx (call failure) */
    public void onCallRefused(Call call, String reason, Message resp) {        
    	log.debug("onCallRefused");
        
    	if (!isCurrentCall(call)) return;
    	
        log.debug("REFUSED (" + reason + ").");
        changeStatus(CallState.UA_IDLE);

        if (call == callTransfer) {
            StatusLine status_line = resp.getStatusLine();
            int code = status_line.getCode();
            // String reason=status_line.getReason();
            this.call.notify(code, reason);
            callTransfer = null;
        }

        notifyListenersOnOutgoingCallFailed();
        waitForIncomingCalls();
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
    	log.debug("onCallCanceling");
        
    	if (!isCurrentCall(call)) return; 
        
        log.debug("CANCEL.");
        changeStatus(CallState.UA_IDLE);
        notifyListenersOfOnIncomingCallCancelled();
        waitForIncomingCalls();
    }
    
    private void notifyListenersOfOnIncomingCallCancelled() {
    	for (SipUserAgentListener listener : listeners) {
    		listener.onIncomingCallCancelled();
    	}
    }


    /** Callback function called when arriving a BYE request */
    public void onCallClosing(Call call, Message bye) {
    	log.debug("onCallClosing");
        
    	if (!isCurrentCallOrCallTransfer(call)) return;

        if (call != callTransfer && callTransfer != null) {
        	log.debug("CLOSE PREVIOUS CALL.");
            this.call = callTransfer;
            callTransfer = null;
            return;
        }
        
        log.debug("CLOSE.");
        
        closeMediaApplication();

        notifyListenersOfOnCallClosed();
        changeStatus(CallState.UA_IDLE);

        // Reset local sdp for next call.
        initSessionDescriptor();
        waitForIncomingCalls();
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
        waitForIncomingCalls();
    }


    /** Callback function called when the invite expires */
    public void onCallTimeout(Call call) {        
    	log.debug("onCallTimeout");
        
    	if (!isCurrentCall(call)) return; 
        
        log.debug("NOT FOUND/TIMEOUT.");
        changeStatus(CallState.UA_IDLE);

        if (call == callTransfer) {
            int code = 408;
            String reason = "Request Timeout";
            this.call.notify(code, reason);
            callTransfer = null;
        }

        notifyListenersOnOutgoingCallFailed();
        waitForIncomingCalls();
    }


    // ****************** ExtendedCall callback functions ******************
    /**
     * Callback function called when arriving a new REFER method (transfer request)
     */
    public void onCallTransfer(ExtendedCall call, NameAddress refer_to, NameAddress refered_by, Message refer) {
    	log.debug("onCallTransfer");
        
    	if (!isCurrentCall(call)) return; 
        
        log.debug("Transfer to " + refer_to.toString() + ".");
        
        call.acceptTransfer();

        callTransfer = new ExtendedCall(sipProvider, userProfile.fromUrl, userProfile.contactUrl, this);
        callTransfer.call(refer_to.toString(), localSession);
    }


    /** Callback function called when a call transfer is accepted. */
    public void onCallTransferAccepted(ExtendedCall call, Message resp) {
    	log.debug("onCallTransferAccepted");
        
    	if (!isCurrentCall(call)) return; 
        
        log.debug("Transfer accepted.");
    }


    /** Callback function called when a call transfer is refused. */
    public void onCallTransferRefused(ExtendedCall call, String reason, Message resp) {
    	log.debug("onCallTransferRefused");        
    	if (!isCurrentCall(call)) return;        
        log.debug("Transfer refused.");
    }


    /** Callback function called when a call transfer is successfully completed */
    public void onCallTransferSuccess(ExtendedCall call, Message notify) {
    	log.debug("onCallTransferSuccess");        
    	if (!isCurrentCall(call)) return;
        
        log.debug("Transfer succeeded.");
        
        call.hangup();

        notifyListenersOfOnCallTransferred();
    }

    private void notifyListenersOfOnCallTransferred() {
    	for (SipUserAgentListener listener : listeners) {
    		listener.onCallTrasferred();
    	}
    }

    /**
     * Callback function called when a call transfer is NOT successfully completed
     */
    public void onCallTransferFailure(ExtendedCall call, String reason, Message notify) {
    	log.debug("onCallTransferFailure");        
    	if (!isCurrentCall(call)) return;
        
        log.info("Transfer failed.");
    }
    
    private boolean isCurrentCallOrCallTransfer(Call call) {
    	return (call == this.call) || (call != callTransfer);
    }
    
    private boolean isCurrentCall(Call call) {
    	return this.call == call;
    }
}
